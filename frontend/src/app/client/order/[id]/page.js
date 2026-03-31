"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { ordersAPI } from "@/lib/api";
import SettingsPanel from "@/components/SettingsPanel";

const STATUS_META = {
  "new": { label: "statusNew", color: "var(--badge-new-color)", bg: "var(--badge-new-bg)", icon: "🆕" },
  "waiting customer response": { label: "statusAwaitingResponse", color: "var(--badge-awaiting-color)", bg: "var(--badge-awaiting-bg)", icon: "💬" },
  "waiting spare parts": { label: "statusAwaitingParts", color: "var(--badge-parts-color)", bg: "var(--badge-parts-bg)", icon: "📦" },
  "in progress": { label: "statusInProgress", color: "var(--badge-inprogress-color)", bg: "var(--badge-inprogress-bg)", icon: "⚙️" },
  "failed": { label: "statusFailed", color: "var(--badge-failed-color)", bg: "var(--badge-failed-bg)", icon: "❌" },
  "done": { label: "statusDone", color: "var(--badge-done-color)", bg: "var(--badge-done-bg)", icon: "✅" },
};

const STATUS_ORDER = ["new", "waiting customer response", "waiting spare parts", "in progress", "failed", "done"];

function StatusChip({ status, t }) {
  const meta = STATUS_META[status] || { label: status, color: "var(--text-muted)", bg: "var(--surface-secondary)", icon: "○" };
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "0.5rem",
      padding: "0.5rem 1rem", borderRadius: "10px",
      background: meta.bg, border: `1.5px solid ${meta.color}33`,
      color: meta.color, fontWeight: 700, fontSize: "0.875rem",
    }}>
      {meta.icon} {t(meta.label)}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-faint)", margin: "0 0 0.2rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
      <p style={{ color: "var(--text)", fontWeight: 600, margin: 0, fontSize: "0.9rem" }}>{value}</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function OrderDetailPage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (user.role === "master") router.replace("/master");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    const fetchOrder = async () => {
      setLoadingOrder(true);
      try {
        const res = await ordersAPI.get(id);
        if (res.success) setOrder(res.data.order);
        else setError(res.message || "Order not found");
      } catch {
        setError("Network error");
      } finally {
        setLoadingOrder(false);
      }
    };
    fetchOrder();
  }, [user, id]);

  useEffect(() => {
    if (!user || !id || !order?.assignedTo) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await ordersAPI.getMessages(id);
        if (res.success) setMessages(res.data.messages);
      } catch {
        console.error("Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [user, id, order?.assignedTo]);

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !order?.assignedTo) return;
    setSendingMessage(true);
    try {
      const res = await ordersAPI.sendMessage(id, messageContent);
      if (res.success) {
        setMessages([...messages, res.data.message]);
        setMessageContent("");
      } else {
        alert(res.message || "Failed to send message");
      }
    } catch {
      alert("Network error");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    setDeleting(true);
    try {
      const res = await ordersAPI.delete(id);
      if (res.success) router.push("/client");
      else alert(res.message || "Failed to delete");
    } catch {
      alert("Network error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !user) return <LoadingScreen />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
      {/* Settings panel */}
      <div style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 20 }}>
        <SettingsPanel />
      </div>

      {/* Nav */}
      <header style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "0 2rem", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "var(--nav-shadow)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><circle cx="12" cy="18" r="1" fill="white" stroke="none" /></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text)", letterSpacing: "-0.02em" }}>{t("appName")}</span>
        </div>
        <Link href="/client" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
          ← {t("back")}
        </Link>
      </header>

      <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        {loadingOrder ? (
          <div style={{ background: "var(--surface)", borderRadius: "16px", padding: "3rem", textAlign: "center", border: "1px solid var(--border)" }}>
            <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ background: "var(--surface)", borderRadius: "16px", padding: "3rem", textAlign: "center", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "2rem" }}>😕</p>
            <h3 style={{ color: "var(--text)" }}>{error}</h3>
            <Link href="/client" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>← {t("back")}</Link>
          </div>
        ) : order && (
          <>
            {/* Order header card */}
            <div style={{
              background: "var(--surface)", borderRadius: "16px",
              boxShadow: "var(--shadow-md)", border: "1px solid var(--border)",
              padding: "1.75rem", marginBottom: "1.25rem",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "12px",
                      background: "linear-gradient(135deg, var(--primary-bg), var(--primary-bg-strong))",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><circle cx="12" cy="18" r="1" fill="var(--primary)" stroke="none" /></svg>
                    </div>
                    <div>
                      <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>
                        {order.deviceModel}
                      </h1>
                      <p style={{ color: "var(--text-faint)", margin: 0, fontSize: "0.85rem" }}>
                        {order.deviceType} • {order.osVersion}
                      </p>
                    </div>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", margin: 0 }}>
                    Order #{order.id.slice(0, 8).toUpperCase()} · Created {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <StatusChip status={order.status} t={t} />
              </div>
            </div>

            {/* Status timeline */}
            <div style={{
              background: "var(--surface)", borderRadius: "16px",
              boxShadow: "var(--shadow-md)", border: "1px solid var(--border)",
              padding: "1.5rem", marginBottom: "1.25rem",
            }}>
              <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1.25rem" }}>{t("repairProgress")}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: "0.25rem" }}>
                {STATUS_ORDER.filter(s => s !== "failed").map((s, i, arr) => {
                  const currentIdx = STATUS_ORDER.indexOf(order.status);
                  const stepIdx = STATUS_ORDER.indexOf(s);
                  const isDone = order.status === "done" ? true : currentIdx > stepIdx;
                  const isCurrent = order.status === s;
                  const meta = STATUS_META[s];
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                      <div style={{ textAlign: "center", minWidth: "80px" }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", margin: "0 auto 0.5rem",
                          border: `2px solid ${isCurrent ? meta.color : isDone ? "var(--success)" : "var(--border)"}`,
                          background: isCurrent ? meta.bg : isDone ? "var(--success-bg)" : "var(--surface)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.85rem",
                        }}>
                          {isDone && !isCurrent ? "✓" : isCurrent ? meta.icon : "○"}
                        </div>
                        <p style={{
                          fontSize: "0.68rem", fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? meta.color : isDone ? "var(--success)" : "var(--text-faint)",
                          margin: 0, lineHeight: 1.3, maxWidth: "72px",
                        }}>{t(meta.label)}</p>
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{ width: 24, height: 2, background: isDone ? "var(--success)" : "var(--border)", flexShrink: 0, margin: "0 -2px 1.5rem" }} />
                      )}
                    </div>
                  );
                })}
                {order.status === "failed" && (
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ color: "var(--danger)", fontWeight: 700, fontSize: "0.875rem" }}>❌ {t("statusFailed")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details grid */}
            <div style={{
              background: "var(--surface)", borderRadius: "16px",
              boxShadow: "var(--shadow-md)", border: "1px solid var(--border)",
              padding: "1.5rem", marginBottom: "1.25rem",
            }}>
              <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1.25rem" }}>{t("orderDetails")}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
                <InfoRow label={t("deviceType")} value={order.deviceType} />
                <InfoRow label={t("deviceModel")} value={order.deviceModel} />
                <InfoRow label={t("osVersion")} value={order.osVersion} />
                <InfoRow label={t("dateOfPurchase")} value={order.dateOfPurchase ? new Date(order.dateOfPurchase).toLocaleDateString() : "—"} />
              </div>
              <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--bg)", paddingTop: "1.25rem" }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", margin: "0 0 0.4rem" }}>{t("issueReported")}</p>
                <p style={{ color: "var(--text)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{order.issueDescription}</p>
              </div>
            </div>

            {/* Technician comment */}
            {order.technicianComment && (
              <div style={{
                background: "linear-gradient(135deg, var(--primary-bg), var(--primary-bg-strong))",
                borderRadius: "16px", border: "1px solid var(--primary-light)",
                padding: "1.5rem", marginBottom: "1.25rem",
              }}>
                <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.75rem" }}>
                  🔧 {t("technicianNote")}
                </h3>
                <p style={{ color: "var(--text)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{order.technicianComment}</p>
                {order.cost && (
                  <p style={{ margin: "0.75rem 0 0", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{t("estimatedCost")}: </span>
                    <span style={{ color: "var(--text)", fontWeight: 700 }}>${parseFloat(order.cost).toFixed(2)}</span>
                  </p>
                )}
              </div>
            )}

            {/* Chat Section */}
            {order.assignedTo ? (
              <div style={{
                background: "var(--surface)", borderRadius: "16px",
                boxShadow: "var(--shadow-md)", border: "1px solid var(--border)",
                padding: "1.5rem", marginBottom: "1.25rem",
                display: "flex", flexDirection: "column", height: "400px",
              }}>
                <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1rem" }}>
                  💬 {t("chatWithTech")} {order.masterName || "technician"}
                </h3>
                
                {/* Messages area */}
                <div style={{
                  flex: 1, overflowY: "auto", marginBottom: "1rem",
                  display: "flex", flexDirection: "column", gap: "0.75rem",
                }}>
                  {loadingMessages ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                      <div style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTop: "2px solid var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--text-faint)", padding: "1rem" }}>
                      <p style={{ fontSize: "0.85rem", margin: 0 }}>{t("noMessages")}</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: msg.senderRole === "client" ? "flex-end" : "flex-start",
                          maxWidth: "70%",
                          padding: "0.75rem 1rem",
                          borderRadius: "10px",
                          background: msg.senderRole === "client" ? "var(--primary-bg)" : "var(--surface-secondary)",
                          borderLeft: `3px solid ${msg.senderRole === "client" ? "var(--primary)" : "var(--text-muted)"}`,
                        }}
                      >
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "0 0 0.25rem", fontWeight: 600 }}>
                          {msg.senderName}
                        </p>
                        <p style={{ fontSize: "0.9rem", color: "var(--text)", margin: 0, wordWrap: "break-word" }}>
                          {msg.content}
                        </p>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-faint)", margin: "0.25rem 0 0" }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Message input */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    placeholder={t("typeMessage")}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={sendingMessage}
                    style={{
                      flex: 1, padding: "0.65rem 1rem", border: "1px solid var(--border)",
                      borderRadius: "8px", fontSize: "0.875rem", outline: "none",
                      background: "var(--input-bg)", color: "var(--text)",
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageContent.trim()}
                    style={{
                      padding: "0.65rem 1.5rem", border: "none", borderRadius: "8px",
                      background: "var(--primary)", color: "white", fontWeight: 600,
                      cursor: sendingMessage || !messageContent.trim() ? "not-allowed" : "pointer",
                      opacity: sendingMessage || !messageContent.trim() ? 0.6 : 1,
                      fontSize: "0.875rem",
                    }}
                  >
                    {sendingMessage ? "..." : t("send")}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: "var(--primary-bg)", borderRadius: "16px", border: "1px dashed var(--border)",
                padding: "1.5rem", marginBottom: "1.25rem", textAlign: "center",
              }}>
                <p style={{ color: "var(--text-faint)", fontSize: "0.9rem", margin: 0 }}>
                  💭 {t("techAssignedSoon")}
                </p>
              </div>
            )}

            {/* Actions */}
            {order.status === "new" && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    padding: "0.75rem 1.5rem", border: "1px solid var(--danger)",
                    borderRadius: "8px", background: "var(--danger-bg)", color: "var(--danger)",
                    cursor: deleting ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.875rem",
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting ? t("deleting") : t("deleteOrder")}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}