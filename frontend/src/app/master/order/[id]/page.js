"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ordersAPI } from "@/lib/api";

const ALL_STATUSES = [
  { value: "new", label: "New", color: "#6366f1", icon: "🆕" },
  { value: "waiting customer response", label: "Awaiting Client", color: "#8b5cf6", icon: "💬" },
  { value: "waiting spare parts", label: "Awaiting Parts", color: "#06b6d4", icon: "📦" },
  { value: "in progress", label: "In Progress", color: "#f59e0b", icon: "⚙️" },
  { value: "failed", label: "Failed", color: "#ef4444", icon: "❌" },
  { value: "done", label: "Done", color: "#10b981", icon: "✅" },
];

export default function MasterOrderEditPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [cost, setCost] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (user.role === "client") router.replace("/client");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    const fetchOrder = async () => {
      setLoadingOrder(true);
      try {
        const res = await ordersAPI.get(id);
        if (res.success) {
          setOrder(res.data.order);
          setStatus(res.data.order.status);
          setComment(res.data.order.technicianComment || "");
          setCost(res.data.order.cost ? String(res.data.order.cost) : "");
        } else {
          setError(res.message || "Order not found");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoadingOrder(false);
      }
    };
    fetchOrder();
  }, [user, id]);

  useEffect(() => {
    if (!user || !id || !order) return;
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
  }, [user, id, order]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError("");
    try {
      const updateData = {
        status,
        technicianComment: comment,
        cost: cost ? parseFloat(cost) : null,
      };
      const res = await ordersAPI.update(id, updateData);
      if (res.success) {
        setOrder(res.data.order);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(res.message || "Failed to save");
      }
    } catch {
      setSaveError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
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

  if (loading || !user) return <LoadingScreen />;

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
      {/* Nav */}
      <header style={{
        background: "#1a1a2e", borderBottom: "1px solid #2d2d4e",
        padding: "0 2rem", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
        boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "white", letterSpacing: "-0.02em" }}>
            Repair Service
            <span style={{ marginLeft: "0.75rem", padding: "0.15rem 0.6rem", background: "#6366f1", color: "white", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Master</span>
          </span>
        </div>
        <Link href="/master" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
          ← Back to orders
        </Link>
      </header>

      <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        {loadingOrder ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #2d2d4e", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ background: "#1a1a2e", borderRadius: "16px", padding: "3rem", textAlign: "center", border: "1px solid #2d2d4e" }}>
            <p style={{ fontSize: "2rem" }}>😕</p>
            <h3 style={{ color: "white" }}>{error}</h3>
            <Link href="/master" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>← Back</Link>
          </div>
        ) : order && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.25rem", alignItems: "start" }}>
            {/* Left: order info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Device header */}
              <div style={{ background: "#1a1a2e", borderRadius: "16px", border: "1px solid #2d2d4e", padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: "14px",
                    background: "linear-gradient(135deg, #1e1e45, #2d2d5e)",
                    border: "1px solid #6366f1",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><circle cx="12" cy="18" r="1" fill="#818cf8" stroke="none" /></svg>
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.02em" }}>{order.deviceModel}</h2>
                    <p style={{ color: "#6b7280", margin: 0, fontSize: "0.85rem" }}>{order.deviceType} • {order.osVersion}</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <InfoItem label="Order ID" value={`#${order.id.slice(0, 8).toUpperCase()}`} />
                  <InfoItem label="Created" value={new Date(order.createdAt).toLocaleDateString()} />
                  <InfoItem label="Client ID" value={order.clientId.slice(0, 8) + "..."} />
                  <InfoItem label="Purchase Date" value={order.dateOfPurchase ? new Date(order.dateOfPurchase).toLocaleDateString() : "—"} />
                </div>
              </div>

              {/* Issue description */}
              <div style={{ background: "#1a1a2e", borderRadius: "16px", border: "1px solid #2d2d4e", padding: "1.5rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.75rem" }}>Issue Reported</p>
                <p style={{ color: "#d1d5db", fontSize: "0.9rem", lineHeight: 1.65, margin: 0 }}>{order.issueDescription}</p>
              </div>

              {/* Previous comment if any */}
              {order.technicianComment && (
                <div style={{ background: "#141428", borderRadius: "16px", border: "1px solid #6366f133", padding: "1.5rem" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.75rem" }}>Current Technician Note</p>
                  <p style={{ color: "#a5b4fc", fontSize: "0.875rem", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>&ldquo;{order.technicianComment}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Right: edit panel */}
            <div style={{ background: "#1a1a2e", borderRadius: "16px", border: "1px solid #2d2d4e", padding: "1.5rem", position: "sticky", top: "80px" }}>
              <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1.25rem" }}>
                Update Order
              </h3>

              {/* Status picker */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", display: "block", marginBottom: "0.6rem" }}>
                  Status
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {ALL_STATUSES.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStatus(s.value)}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.6rem",
                        padding: "0.55rem 0.875rem", borderRadius: "8px",
                        border: `1.5px solid ${status === s.value ? s.color : "#2d2d4e"}`,
                        background: status === s.value ? `${s.color}18` : "#0f0f1a",
                        cursor: "pointer", textAlign: "left", transition: "all 0.12s",
                      }}
                    >
                      <span style={{ fontSize: "1rem" }}>{s.icon}</span>
                      <span style={{ fontSize: "0.875rem", fontWeight: status === s.value ? 700 : 500, color: status === s.value ? s.color : "#6b7280" }}>
                        {s.label}
                      </span>
                      {status === s.value && (
                        <span style={{ marginLeft: "auto", color: s.color, fontWeight: 700 }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", display: "block", marginBottom: "0.4rem" }}>
                  Repair Cost (optional)
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontWeight: 700 }}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cost}
                    onChange={e => setCost(e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: "100%", padding: "0.6rem 0.875rem 0.6rem 1.75rem",
                      border: "1px solid #2d2d4e", borderRadius: "8px",
                      background: "#0f0f1a", color: "white", fontSize: "0.9rem",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Comment */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", display: "block", marginBottom: "0.4rem" }}>
                  Technician Comment
                </label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add diagnostic notes, repair details, or instructions for the client..."
                  rows={5}
                  style={{
                    width: "100%", padding: "0.65rem 0.875rem",
                    border: "1px solid #2d2d4e", borderRadius: "8px",
                    background: "#0f0f1a", color: "white", fontSize: "0.875rem",
                    outline: "none", resize: "vertical", minHeight: "100px",
                    boxSizing: "border-box", lineHeight: 1.55, fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Save feedback */}
              {saveSuccess && (
                <div style={{ background: "#052e16", border: "1px solid #16a34a", borderRadius: "8px", padding: "0.65rem 1rem", marginBottom: "1rem", color: "#4ade80", fontSize: "0.875rem", fontWeight: 600 }}>
                  ✓ Order updated successfully
                </div>
              )}
              {saveError && (
                <div style={{ background: "#2d0a0a", border: "1px solid #ef4444", borderRadius: "8px", padding: "0.65rem 1rem", marginBottom: "1rem", color: "#f87171", fontSize: "0.875rem" }}>
                  ⚠️ {saveError}
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: "100%", padding: "0.75rem",
                  background: saving ? "#3d3d6e" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white", border: "none", borderRadius: "8px",
                  fontWeight: 700, fontSize: "0.9rem",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}
              >
                {saving ? (
                  <>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                    Saving...
                  </>
                ) : "💾 Save Changes"}
              </button>

              {/* Chat Section */}
              <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #2d2d4e" }}>
                <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1rem" }}>
                  💬 Chat with {order?.clientUsername || "client"}
                </h3>
                
                {/* Messages area */}
                <div style={{
                  background: "#0f0f1a", borderRadius: "8px", border: "1px solid #2d2d4e",
                  height: "250px", overflowY: "auto", padding: "0.75rem",
                  marginBottom: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem",
                }}>
                  {loadingMessages ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                      <div style={{ width: 20, height: 20, border: "2px solid #2d2d4e", borderTop: "2px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#6b7280", padding: "1rem" }}>
                      <p style={{ fontSize: "0.8rem", margin: 0 }}>No messages yet.</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: msg.senderRole === "master" ? "flex-end" : "flex-start",
                          maxWidth: "85%",
                          padding: "0.6rem 0.8rem",
                          borderRadius: "8px",
                          background: msg.senderRole === "master" ? "#6366f1" : "#2d2d4e",
                          borderLeft: `2px solid ${msg.senderRole === "master" ? "#818cf8" : "#9ca3af"}`,
                        }}
                      >
                        <p style={{ fontSize: "0.65rem", color: msg.senderRole === "master" ? "#c7d2fe" : "#9ca3af", margin: "0 0 0.2rem", fontWeight: 600 }}>
                          {msg.senderName}
                        </p>
                        <p style={{ fontSize: "0.8rem", color: msg.senderRole === "master" ? "#f0f4ff" : "#d1d5db", margin: 0, wordWrap: "break-word" }}>
                          {msg.content}
                        </p>
                        <p style={{ fontSize: "0.65rem", color: msg.senderRole === "master" ? "#a5b4fc" : "#6b7280", margin: "0.2rem 0 0" }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Message input */}
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={sendingMessage}
                    style={{
                      flex: 1, padding: "0.55rem 0.75rem", border: "1px solid #2d2d4e",
                      borderRadius: "6px", fontSize: "0.8rem", outline: "none",
                      background: "#0f0f1a", color: "white",
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageContent.trim()}
                    style={{
                      padding: "0.55rem 0.85rem", border: "none", borderRadius: "6px",
                      background: "#6366f1", color: "white", fontWeight: 600,
                      cursor: sendingMessage || !messageContent.trim() ? "not-allowed" : "pointer",
                      opacity: sendingMessage || !messageContent.trim() ? 0.6 : 1,
                      fontSize: "0.75rem",
                    }}
                  >
                    {sendingMessage ? "..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", margin: "0 0 0.2rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
      <p style={{ color: "#d1d5db", fontWeight: 600, margin: 0, fontSize: "0.875rem", wordBreak: "break-all" }}>{value}</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f1a" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #2d2d4e", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}