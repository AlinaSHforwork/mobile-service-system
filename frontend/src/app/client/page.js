"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ordersAPI } from "@/lib/api";

const STATUS_META = {
  "new": { label: "New", color: "#6366f1", bg: "#eef2ff" },
  "waiting customer response": { label: "Awaiting Your Response", color: "#8b5cf6", bg: "#f5f3ff" },
  "waiting spare parts": { label: "Awaiting Parts", color: "#06b6d4", bg: "#ecfeff" },
  "in progress": { label: "In Progress", color: "#f59e0b", bg: "#fffbeb" },
  "failed": { label: "Failed", color: "#ef4444", bg: "#fef2f2" },
  "done": { label: "Done", color: "#10b981", bg: "#ecfdf5" },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.35rem",
      padding: "0.25rem 0.75rem", borderRadius: "2rem", fontSize: "0.78rem",
      fontWeight: 600, color: meta.color, background: meta.bg,
      border: `1px solid ${meta.color}22`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, display: "inline-block" }} />
      {meta.label}
    </span>
  );
}

export default function ClientPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (user.role === "master") router.replace("/master");
    }
  }, [user, loading, router]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoadingOrders(true);
    setError("");
    try {
      const res = await ordersAPI.list({ search, page, limit: 10 });
      if (res.success) {
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
      } else {
        setError(res.message || "Failed to load orders");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingOrders(false);
    }
  }, [user, search, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this order?")) return;
    setDeletingId(id);
    try {
      const res = await ordersAPI.delete(id);
      if (res.success) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        setPagination((p) => ({ ...p, total: p.total - 1 }));
      } else {
        alert(res.message || "Failed to delete order");
      }
    } catch {
      alert("Network error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (loading || !user) return <LoadingScreen />;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2fa", fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
      {/* Top nav */}
      <header style={{
        background: "white", borderBottom: "1px solid #e8eaf0",
        padding: "0 2rem", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 12px rgba(99,102,241,0.06)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "10px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <circle cx="12" cy="18" r="1" fill="white" stroke="none" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#1e1b4b", letterSpacing: "-0.02em" }}>
            Repair Service
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/client/create-order" style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "white", padding: "0.5rem 1.25rem",
            borderRadius: "8px", textDecoration: "none", fontWeight: 700,
            fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem",
          }}>
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span> New Order
          </Link>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e1b4b", margin: 0 }}>{user.username}</p>
            <p style={{ fontSize: "0.72rem", color: "#6366f1", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Client</p>
          </div>
          <button onClick={handleLogout} style={{
            padding: "0.45rem 0.9rem", border: "1px solid #e8eaf0",
            borderRadius: "8px", background: "white", color: "#6b7280",
            fontSize: "0.875rem", cursor: "pointer", fontWeight: 500,
          }}>Sign Out</button>
        </div>
      </header>

      <main style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total Orders", value: pagination.total, icon: "📋" },
            { label: "In Progress", value: orders.filter(o => o.status === "in progress").length, icon: "⚙️" },
            { label: "Completed", value: orders.filter(o => o.status === "done").length, icon: "✅" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "white", borderRadius: "12px", padding: "1.25rem",
              boxShadow: "0 1px 8px rgba(0,0,0,0.05)", border: "1px solid #e8eaf0",
              display: "flex", alignItems: "center", gap: "1rem",
            }}>
              <span style={{ fontSize: "1.75rem" }}>{stat.icon}</span>
              <div>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1e1b4b", margin: 0 }}>{stat.value}</p>
                <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: 0, fontWeight: 500 }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Orders panel */}
        <div style={{
          background: "white", borderRadius: "16px",
          boxShadow: "0 1px 12px rgba(0,0,0,0.06)", border: "1px solid #e8eaf0",
          overflow: "hidden",
        }}>
          {/* Header row */}
          <div style={{
            padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f2fa",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
          }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e1b4b", margin: 0 }}>My Repair Orders</h2>
              <p style={{ fontSize: "0.78rem", color: "#9ca3af", margin: 0 }}>{pagination.total} total orders</p>
            </div>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{
                  padding: "0.5rem 0.875rem 0.5rem 2.25rem", border: "1px solid #e8eaf0",
                  borderRadius: "8px", fontSize: "0.875rem", outline: "none", width: "220px",
                  color: "#374151",
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: "1rem 1.5rem", background: "#fef2f2", color: "#ef4444", fontSize: "0.875rem" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Orders list */}
          {loadingOrders ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <div style={{ width: 36, height: 36, border: "3px solid #e8eaf0", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
              <h3 style={{ color: "#1e1b4b", fontWeight: 700, margin: "0 0 0.5rem" }}>No orders yet</h3>
              <p style={{ color: "#9ca3af", margin: "0 0 1.5rem" }}>
                {search ? "No orders match your search" : "Create your first repair order"}
              </p>
              {!search && (
                <Link href="/client/create-order" style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white", padding: "0.65rem 1.5rem",
                  borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem",
                }}>
                  + Create Order
                </Link>
              )}
            </div>
          ) : (
            <div>
              {orders.map((order, i) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  isLast={i === orders.length - 1}
                  onDelete={() => handleDelete(order.id)}
                  deleting={deletingId === order.id}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{
              padding: "1rem 1.5rem", borderTop: "1px solid #f0f2fa",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: "0.4rem 0.9rem", border: "1px solid #e8eaf0", borderRadius: "6px",
                    background: "white", color: page === 1 ? "#d1d5db" : "#374151",
                    cursor: page === 1 ? "not-allowed" : "pointer", fontSize: "0.85rem", fontWeight: 500,
                  }}
                >← Prev</button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  style={{
                    padding: "0.4rem 0.9rem", border: "1px solid #e8eaf0", borderRadius: "6px",
                    background: "white", color: page === pagination.totalPages ? "#d1d5db" : "#374151",
                    cursor: page === pagination.totalPages ? "not-allowed" : "pointer", fontSize: "0.85rem", fontWeight: 500,
                  }}
                >Next →</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function OrderRow({ order, isLast, onDelete, deleting }) {
  const router = useRouter();
  const canDelete = order.status === "new";

  return (
    <div
      style={{
        padding: "1.25rem 1.5rem",
        borderBottom: isLast ? "none" : "1px solid #f0f2fa",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "1rem", flexWrap: "wrap",
        cursor: "pointer", transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
      onMouseLeave={e => e.currentTarget.style.background = "white"}
      onClick={() => router.push(`/client/order/${order.id}`)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0 }}>
        <div style={{
          width: 42, height: 42, borderRadius: "10px",
          background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <circle cx="12" cy="18" r="1" fill="#6366f1" stroke="none" />
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 700, color: "#1e1b4b", margin: 0, fontSize: "0.95rem" }}>
            {order.deviceModel}
          </p>
          <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "320px" }}>
            {order.issueDescription}
          </p>
          {order.masterName && (
            <p style={{ color: "#8b5cf6", margin: "0.25rem 0 0 0", fontSize: "0.75rem", fontWeight: 500 }}>
              🔧 {order.masterName}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexShrink: 0 }}>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: 0 }}>{order.deviceType} • {order.osVersion}</p>
          <p style={{ fontSize: "0.75rem", color: "#c4c7d4", margin: 0 }}>
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={order.status} />
        <div style={{ display: "flex", gap: "0.4rem" }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => router.push(`/client/order/${order.id}`)}
            style={{
              padding: "0.35rem 0.75rem", border: "1px solid #e8eaf0", borderRadius: "6px",
              background: "white", color: "#6366f1", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
            }}
          >View</button>
          {canDelete && (
            <button
              onClick={() => onDelete()}
              disabled={deleting}
              style={{
                padding: "0.35rem 0.75rem", border: "1px solid #fee2e2", borderRadius: "6px",
                background: "#fef2f2", color: "#ef4444", cursor: deleting ? "not-allowed" : "pointer",
                fontSize: "0.8rem", fontWeight: 600, opacity: deleting ? 0.6 : 1,
              }}
            >{deleting ? "..." : "Delete"}</button>
          )}
        </div>
      </div>
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