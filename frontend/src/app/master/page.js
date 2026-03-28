"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ordersAPI } from "@/lib/api";

const STATUS_META = {
  "new": { label: "New", color: "#6366f1", bg: "#eef2ff" },
  "waiting customer response": { label: "Awaiting Client", color: "#8b5cf6", bg: "#f5f3ff" },
  "waiting spare parts": { label: "Awaiting Parts", color: "#06b6d4", bg: "#ecfeff" },
  "in progress": { label: "In Progress", color: "#f59e0b", bg: "#fffbeb" },
  "failed": { label: "Failed", color: "#ef4444", bg: "#fef2f2" },
  "done": { label: "Done", color: "#10b981", bg: "#ecfdf5" },
};

const ALL_STATUSES = Object.keys(STATUS_META);

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.3rem",
      padding: "0.2rem 0.65rem", borderRadius: "2rem", fontSize: "0.75rem",
      fontWeight: 700, color: meta.color, background: meta.bg,
      border: `1px solid ${meta.color}22`, whiteSpace: "nowrap",
      width: `150px`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, display: "inline-block", flexShrink: 0 }} />
      {meta.label}
    </span>
  );
}

export default function MasterPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [allOrdersForCounts, setAllOrdersForCounts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // "all", "available", "my-orders"
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (user.role === "client") router.replace("/client");
    }
  }, [user, loading, router]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoadingOrders(true);
    setError("");
    try {
      let res;
      if (filterMode === "my-orders") {
        res = await ordersAPI.getMyOrders({ search, status: statusFilter, page, limit: 15 });
      } else if (filterMode === "available") {
        res = await ordersAPI.getAvailable({ search, status: statusFilter || "new", page, limit: 15 });
      } else {
        res = await ordersAPI.list({ search, status: statusFilter, page, limit: 15 });
      }
      
      if (res.success) {
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
        setAllOrdersForCounts(res.data.orders);
      } else {
        setError(res.message || "Failed to load orders")
      }
    } catch {
      setError("Network error");
    } finally {
      setLoadingOrders(false);
    }
  }, [user, search, statusFilter, page, filterMode]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleLogout = async () => { await logout(); router.replace("/"); };

  if (loading || !user) return <LoadingScreen />;

  const urgentCount = allOrdersForCounts.filter(o => o.status === "waiting customer response").length;
  const newCount = allOrdersForCounts.filter(o => o.status === "new").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
      {/* Dark master nav */}
      <header style={{
        background: "#1a1a2e", borderBottom: "1px solid #2d2d4e",
        padding: "0 2rem", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
        boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "10px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "white", letterSpacing: "-0.02em" }}>
              Repair Service
            </span>
            <span style={{ marginLeft: "0.75rem", padding: "0.15rem 0.6rem", background: "#6366f1", color: "white", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Master
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "white", margin: 0 }}>{user.username}</p>
            <p style={{ fontSize: "0.72rem", color: "#8b5cf6", margin: 0, fontWeight: 600 }}>Technician</p>
          </div>
          <button onClick={handleLogout} style={{
            padding: "0.45rem 0.9rem", border: "1px solid #2d2d4e",
            borderRadius: "8px", background: "transparent", color: "#9ca3af",
            fontSize: "0.875rem", cursor: "pointer",
          }}>Sign Out</button>
        </div>
      </header>

      <main style={{ padding: "1.75rem 2rem", maxWidth: "1300px", margin: "0 auto" }}>
        {/* Page title + alerts */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "white", margin: "0 0 0.5rem", letterSpacing: "-0.03em" }}>
            Repair Orders
          </h1>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {newCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.8rem", background: "#1a1a3e", border: "1px solid #6366f1", borderRadius: "8px", color: "#818cf8", fontSize: "0.8rem", fontWeight: 600 }}>
                🆕 {newCount} new order{newCount > 1 ? "s" : ""} waiting
              </div>
            )}
            {urgentCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.8rem", background: "#2d1657", border: "1px solid #8b5cf6", borderRadius: "8px", color: "#c4b5fd", fontSize: "0.8rem", fontWeight: 600 }}>
                💬 {urgentCount} awaiting client response
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {ALL_STATUSES.map(s => {
            const count = allOrdersForCounts.filter(o => o.status === s).length;
            const meta = STATUS_META[s];
            return (
              <button
                key={s}
                onClick={() => { setStatusFilter(statusFilter === s ? "" : s); setPage(1); }}
                style={{
                  background: statusFilter === s ? meta.bg : "#1a1a2e",
                  border: `1px solid ${statusFilter === s ? meta.color : "#2d2d4e"}`,
                  borderRadius: "10px", padding: "0.9rem 1rem",
                  cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                }}
              >
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: statusFilter === s ? meta.color : "white", margin: 0 }}>{count}</p>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: statusFilter === s ? meta.color : "#6b7280", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>{meta.label}</p>
              </button>
            );
          })}
        </div>

        {/* Filter mode tabs */}
        <div style={{
          display: "flex", gap: "0.75rem", marginBottom: "1.25rem",
          borderBottom: "1px solid #2d2d4e", paddingBottom: "0.75rem",
        }}>
          {[
            { value: "all", label: "All Orders" },
            { value: "available", label: "Available" },
            { value: "my-orders", label: "My Orders" },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setFilterMode(tab.value); setPage(1); }}
              style={{
                padding: "0.5rem 1rem", borderBottom: filterMode === tab.value ? "2px solid #6366f1" : "none",
                color: filterMode === tab.value ? "#6366f1" : "#6b7280",
                background: "transparent", border: "none", cursor: "pointer",
                fontSize: "0.875rem", fontWeight: filterMode === tab.value ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters + search */}
        <div style={{
          background: "#1a1a2e", borderRadius: "12px", border: "1px solid #2d2d4e",
          padding: "1rem 1.5rem", marginBottom: "1.25rem",
          display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
        }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <svg style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text" placeholder="Search by model, issue, comment..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: "100%", padding: "0.55rem 0.875rem 0.55rem 2.25rem",
                border: "1px solid #2d2d4e", borderRadius: "8px",
                fontSize: "0.875rem", background: "#0f0f1a", color: "white",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              padding: "0.55rem 1rem", border: "1px solid #2d2d4e",
              borderRadius: "8px", background: "#0f0f1a", color: "white",
              fontSize: "0.875rem", outline: "none", cursor: "pointer",
            }}
          >
            <option value="">All statuses</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </select>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(""); setStatusFilter(""); setPage(1); }}
              style={{ color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
              Clear
            </button>
          )}
        </div>

        {/* Orders table */}
        <div style={{
          background: "#1a1a2e", borderRadius: "16px", border: "1px solid #2d2d4e",
          overflow: "hidden",
        }}>
          {error && (
            <div style={{ padding: "1rem 1.5rem", background: "#2d1515", color: "#f87171", fontSize: "0.875rem" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 1fr 1fr",
            padding: "0.75rem 1.5rem", borderBottom: "1px solid #2d2d4e",
          }}>
            {["Device / Issue", "Status", "Created", "Cost", "Action"].map(h => (
              <p key={h} style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b7280", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</p>
            ))}
          </div>

          {loadingOrders ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <div style={{ width: 36, height: 36, border: "3px solid #2d2d4e", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <p style={{ fontSize: "2rem", margin: "0 0 0.75rem" }}>🔍</p>
              <p style={{ color: "#6b7280", fontWeight: 600 }}>No orders found</p>
            </div>
          ) : (
            orders.map((order, i) => (
              <MasterOrderRow
                key={order.id}
                order={order}
                user={user}
                isLast={i === orders.length - 1}
                onEdit={() => router.push(`/master/order/${order.id}`)}
              />
            ))
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{
              padding: "1rem 1.5rem", borderTop: "1px solid #2d2d4e",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                {pagination.total} total · Page {pagination.page} of {pagination.totalPages}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: "0.4rem 0.9rem", border: "1px solid #2d2d4e", borderRadius: "6px", background: "#0f0f1a", color: page === 1 ? "#3d3d5e" : "#9ca3af", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: "0.85rem" }}>
                  ← Prev
                </button>
                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                  style={{ padding: "0.4rem 0.9rem", border: "1px solid #2d2d4e", borderRadius: "6px", background: "#0f0f1a", color: page === pagination.totalPages ? "#3d3d5e" : "#9ca3af", cursor: page === pagination.totalPages ? "not-allowed" : "pointer", fontSize: "0.85rem" }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MasterOrderRow({ order, user, isLast, onEdit }) {
  return (
    <div
      style={{
        display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 1fr 1fr",
        padding: "1rem 1.5rem",
        borderBottom: isLast ? "none" : "1px solid #2d2d4e",
        alignItems: "center", cursor: "pointer", transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#1e1e35"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div>
        <p style={{ fontWeight: 700, color: "white", margin: 0, fontSize: "0.9rem" }}>{order.deviceModel}</p>
        <p style={{ color: "#6b7280", margin: 0, fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>
          {order.issueDescription}
        </p>
        <p style={{ color: "#818cf8", margin: "0.25rem 0 0 0", fontSize: "0.75rem", fontWeight: 500 }}>
          👤 {order.clientUsername}
        </p>
      </div>
      <StatusBadge status={order.status} />
      <p style={{ color: "#6b7280", margin: 0, fontSize: "0.8rem" }}>{new Date(order.createdAt).toLocaleDateString()}</p>
      <p style={{ color: order.cost ? "#10b981" : "#3d3d5e", margin: 0, fontSize: "0.8rem", fontWeight: 600 }}>
        {order.cost ? `$${parseFloat(order.cost).toFixed(2)}` : "—"}
      </p>
      <div style={{ display: "flex", gap: "0.4rem" }} onClick={e => e.stopPropagation()}>
        {!order.assignedTo ? (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const res = await ordersAPI.assign(order.id);
              if (res.success) window.location.reload();
            }}
            style={{
              padding: "0.35rem 0.75rem", background: "#6366f1",
              border: "none", borderRadius: "6px", color: "white",
              cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Claim
          </button>
        ) : order.assignedTo === user.id ? (
          <button
            onClick={() => onEdit()}
            style={{
              padding: "0.35rem 0.85rem", background: "#1e1e45",
              border: "1px solid #6366f1", borderRadius: "6px",
              color: "#818cf8", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
              width: "fit-content", whiteSpace: "nowrap",
            }}
          >
            Edit →
          </button>
        ) : null}
      </div>
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