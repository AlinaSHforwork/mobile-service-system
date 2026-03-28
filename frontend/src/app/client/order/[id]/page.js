"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ordersAPI } from "@/lib/api";

const STATUS_META = {
  "new": { label: "New", color: "#6366f1", bg: "#eef2ff", icon: "🆕" },
  "waiting customer response": { label: "Awaiting Your Response", color: "#8b5cf6", bg: "#f5f3ff", icon: "💬" },
  "waiting spare parts": { label: "Awaiting Spare Parts", color: "#06b6d4", bg: "#ecfeff", icon: "📦" },
  "in progress": { label: "In Progress", color: "#f59e0b", bg: "#fffbeb", icon: "⚙️" },
  "failed": { label: "Failed", color: "#ef4444", bg: "#fef2f2", icon: "❌" },
  "done": { label: "Completed", color: "#10b981", bg: "#ecfdf5", icon: "✅" },
};

const STATUS_ORDER = ["new", "waiting customer response", "waiting spare parts", "in progress", "failed", "done"];

export default function OrderDetailPage() {
  const { user, loading } = useAuth();
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
    <div style={{ minHeight: "100vh", background: "#f0f2fa", fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
      {/* Nav */}
      <header style={{
        background: "white", borderBottom: "1px solid #e8eaf0",
        padding: "0 2rem", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 12px rgba(99,102,241,0.06)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><circle cx="12" cy="18" r="1" fill="white" stroke="none" /></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#1e1b4b", letterSpacing: "-0.02em" }}>Repair Service</span>
        </div>
        <Link href="/client" style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
          ← Back to orders
        </Link>
      </header>

      <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        {loadingOrder ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #e8eaf0", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ background: "white", borderRadius: "16px", padding: "3rem", textAlign: "center", border: "1px solid #e8eaf0" }}>
            <p style={{ fontSize: "2rem" }}>😕</p>
            <h3 style={{ color: "#1e1b4b" }}>{error}</h3>
            <Link href="/client" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>← Back to orders</Link>
          </div>
        ) : order && (
          <>
            {/* Order header card */}
            <div style={{
              background: "white", borderRadius: "16px",
              boxShadow: "0 1px 12px rgba(0,0,0,0.06)", border: "1px solid #e8eaf0",
              padding: "1.75rem", marginBottom: "1.25rem",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "12px",
                      background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><circle cx="12" cy="18" r="1" fill="#6366f1" stroke="none" /></svg>
                    </div>
                    <div>
                      <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1e1b4b", margin: 0, letterSpacing: "-0.02em" }}>
                        {order.deviceModel}
                      </h1>
                      <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.85rem" }}>
                        {order.deviceType} • {order.osVersion}
                      </p>
                    </div>
                  </div>
                  <p style={{ color: "#6b7280", fontSize: "0.78rem", margin: 0 }}>
                    Order #{order.id.slice(0, 8).toUpperCase()} · Created {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <StatusChip status={order.status} />
              </div>
            </div>

            {/* Status timeline */}
            <div style={{
              background: "white", borderRadius: "16px",
              boxShadow: "0 1px 12px rgba(0,0,0,0.06)", border: "1px solid #e8eaf0",
              padding: "1.5rem", marginBottom: "1.25rem",
            }}>
              <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1.25rem" }}>Repair Progress</h3>
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
                          border: `2px solid ${isCurrent ? meta.color : isDone ? "#10b981" : "#e8eaf0"}`,
                          background: isCurrent ? meta.bg : isDone ? "#ecfdf5" : "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.85rem",
                        }}>
                          {isDone && !isCurrent ? "✓" : isCurrent ? meta.icon : "○"}
                        </div>
                        <p style={{
                          fontSize: "0.68rem", fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? meta.color : isDone ? "#10b981" : "#9ca3af",
                          margin: 0, lineHeight: 1.3, maxWidth: "72px",
                        }}>{meta.label}</p>
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{ width: 24, height: 2, background: isDone ? "#10b981" : "#e8eaf0", flexShrink: 0, margin: "0 -2px 1.5rem" }} />
                      )}
                    </div>
                  );
                })}
                {order.status === "failed" && (
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ color: "#ef4444", fontWeight: 700, fontSize: "0.875rem" }}>❌ Failed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details grid */}
            <div style={{
              background: "white", borderRadius: "16px",
              boxShadow: "0 1px 12px rgba(0,0,0,0.06)", border: "1px solid #e8eaf0",
              padding: "1.5rem", marginBottom: "1.25rem",
            }}>
              <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1.25rem" }}>Order Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
                <InfoRow label="Device Type" value={order.deviceType} />
                <InfoRow label="Device Model" value={order.deviceModel} />
                <InfoRow label="OS Version" value={order.osVersion} />
                <InfoRow label="Date of Purchase" value={order.dateOfPurchase ? new Date(order.dateOfPurchase).toLocaleDateString() : "—"} />
              </div>
              <div style={{ marginTop: "1.25rem", borderTop: "1px solid #f0f2fa", paddingTop: "1.25rem" }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", margin: "0 0 0.4rem" }}>Issue Description</p>
                <p style={{ color: "#374151", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{order.issueDescription}</p>
              </div>
            </div>

            {/* Technician comment */}
            {order.technicianComment && (
              <div style={{
                background: "linear-gradient(135deg, #f5f3ff, #eef2ff)",
                borderRadius: "16px", border: "1px solid #ddd6fe",
                padding: "1.5rem", marginBottom: "1.25rem",
              }}>
                <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.75rem" }}>
                  🔧 Technician&apos;s Note
                </h3>
                <p style={{ color: "#374151", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{order.technicianComment}</p>
                {order.cost && (
                  <p style={{ margin: "0.75rem 0 0", fontSize: "0.875rem" }}>
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>Estimated cost: </span>
                    <span style={{ color: "#1e1b4b", fontWeight: 700 }}>${parseFloat(order.cost).toFixed(2)}</span>
                  </p>
                )}
              </div>
            )}

            {/* Chat Section */}
            {order.assignedTo ? (
              <div style={{
                background: "white", borderRadius: "16px",
                boxShadow: "0 1px 12px rgba(0,0,0,0.06)", border: "1px solid #e8eaf0",
                padding: "1.5rem", marginBottom: "1.25rem",
                display: "flex", flexDirection: "column", height: "400px",
              }}>
                <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1rem" }}>
                  💬 Chat with {order.masterName || "technician"}
                </h3>
                
                {/* Messages area */}
                <div style={{
                  flex: 1, overflowY: "auto", marginBottom: "1rem",
                  display: "flex", flexDirection: "column", gap: "0.75rem",
                }}>
                  {loadingMessages ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                      <div style={{ width: 24, height: 24, border: "2px solid #e8eaf0", borderTop: "2px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#9ca3af", padding: "1rem" }}>
                      <p style={{ fontSize: "0.85rem", margin: 0 }}>No messages yet. Start a conversation!</p>
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
                          background: msg.senderRole === "client" ? "#eef2ff" : "#f3f4f6",
                          borderLeft: `3px solid ${msg.senderRole === "client" ? "#6366f1" : "#9ca3af"}`,
                        }}
                      >
                        <p style={{ fontSize: "0.7rem", color: "#6b7280", margin: "0 0 0.25rem", fontWeight: 600 }}>
                          {msg.senderName}
                        </p>
                        <p style={{ fontSize: "0.9rem", color: "#374151", margin: 0, wordWrap: "break-word" }}>
                          {msg.content}
                        </p>
                        <p style={{ fontSize: "0.7rem", color: "#9ca3af", margin: "0.25rem 0 0" }}>
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
                    placeholder="Type a message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={sendingMessage}
                    style={{
                      flex: 1, padding: "0.65rem 1rem", border: "1px solid #e8eaf0",
                      borderRadius: "8px", fontSize: "0.875rem", outline: "none",
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageContent.trim()}
                    style={{
                      padding: "0.65rem 1.5rem", border: "none", borderRadius: "8px",
                      background: "#6366f1", color: "white", fontWeight: 600,
                      cursor: sendingMessage || !messageContent.trim() ? "not-allowed" : "pointer",
                      opacity: sendingMessage || !messageContent.trim() ? 0.6 : 1,
                      fontSize: "0.875rem",
                    }}
                  >
                    {sendingMessage ? "..." : "Send"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: "#f0f2fa", borderRadius: "16px", border: "1px dashed #d1d5db",
                padding: "1.5rem", marginBottom: "1.25rem", textAlign: "center",
              }}>
                <p style={{ color: "#9ca3af", fontSize: "0.9rem", margin: 0 }}>
                  💭 A technician will be assigned to this order soon. Chat will be available then.
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
                    padding: "0.65rem 1.5rem", border: "1px solid #fca5a5",
                    borderRadius: "8px", background: "#fef2f2", color: "#ef4444",
                    cursor: deleting ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.875rem",
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting ? "Deleting..." : "🗑️ Delete Order"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatusChip({ status }) {
  const meta = STATUS_META[status] || { label: status, color: "#6b7280", bg: "#f3f4f6", icon: "○" };
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "0.5rem",
      padding: "0.5rem 1rem", borderRadius: "10px",
      background: meta.bg, border: `1.5px solid ${meta.color}33`,
      color: meta.color, fontWeight: 700, fontSize: "0.875rem",
    }}>
      {meta.icon} {meta.label}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#9ca3af", margin: "0 0 0.2rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
      <p style={{ color: "#1e1b4b", fontWeight: 600, margin: 0, fontSize: "0.9rem" }}>{value}</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2fa" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e8eaf0", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}