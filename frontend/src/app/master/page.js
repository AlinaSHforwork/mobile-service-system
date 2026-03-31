"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { ordersAPI } from "@/lib/api";
import SettingsPanel from "@/components/SettingsPanel";

const STATUS_META = {
  "new": { label: "statusNew", color: "var(--badge-new-color)", bg: "var(--badge-new-bg)" },
  "waiting customer response": { label: "statusAwaitingResponse", color: "var(--badge-awaiting-color)", bg: "var(--badge-awaiting-bg)" },
  "waiting spare parts": { label: "statusAwaitingParts", color: "var(--badge-parts-color)", bg: "var(--badge-parts-bg)" },
  "in progress": { label: "statusInProgress", color: "var(--badge-inprogress-color)", bg: "var(--badge-inprogress-bg)" },
  "failed": { label: "statusFailed", color: "var(--badge-failed-color)", bg: "var(--badge-failed-bg)" },
  "done": { label: "statusDone", color: "var(--badge-done-color)", bg: "var(--badge-done-bg)" },
};

const ALL_STATUSES = Object.keys(STATUS_META);

function StatusBadge({ status, t }) {
  const meta = STATUS_META[status] || { label: status, color: "var(--text-muted)", bg: "var(--surface-secondary)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.35rem",
      padding: "0.25rem 0.75rem", borderRadius: "2rem", fontSize: "0.78rem",
      fontWeight: 600, color: meta.color, background: meta.bg,
      border: `1px solid ${meta.color}22`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, display: "inline-block" }} />
      {t(meta.label)}
    </span>
  );
}

export default function MasterPage() {
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
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
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'Outfit', 'DM Sans', sans-serif", position: "relative" }}>
      <SettingsPanel />
      {/* Dark master nav */}
      <header style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "0 2rem", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
        boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "10px",
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-on-primary)" strokeWidth="2" strokeLinecap="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text)", letterSpacing: "-0.02em" }}>
              {t("appName")}
            </span>
            <span style={{ marginLeft: "0.75rem", padding: "0.15rem 0.6rem", background: "var(--primary)", color: "var(--text-on-primary)", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {t("master")}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{user.username}</p>
            <p style={{ fontSize: "0.72rem", color: "var(--accent)", margin: 0, fontWeight: 600 }}>{t("technician")}</p>
          </div>
          <button onClick={handleLogout} style={{
            padding: "0.45rem 0.9rem", border: "1px solid var(--border)",
            borderRadius: "8px", background: "transparent", color: "var(--text-faint)",
            fontSize: "0.875rem", cursor: "pointer",
          }}>{t("signOut")}</button>
        </div>
      </header>

      <main style={{ padding: "1.75rem 2rem", maxWidth: "1300px", margin: "0 auto" }}>
        {/* Page title + alerts */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", margin: "0 0 0.5rem", letterSpacing: "-0.03em" }}>
            {t("repairOrders")}
          </h1>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {newCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.8rem", background: "var(--primary-bg)", border: "1px solid var(--primary)", borderRadius: "8px", color: "var(--primary)", fontSize: "0.8rem", fontWeight: 600 }}>
                🆕 {newCount} {t("newOrdersWaiting")}
              </div>
            )}
            {urgentCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.8rem", background: "var(--primary-bg)", border: "1px solid var(--accent)", borderRadius: "8px", color: "var(--accent)", fontSize: "0.8rem", fontWeight: 600 }}>
                💬 {urgentCount} {t("awaitingClientResponse")}
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
                  background: statusFilter === s ? meta.bg : "var(--surface)",
                  border: `1px solid ${statusFilter === s ? meta.color : "var(--border)"}`,
                  borderRadius: "10px", padding: "0.9rem 1rem",
                  cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                }}
              >
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: statusFilter === s ? meta.color : "var(--text)", margin: 0 }}>{count}</p>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: statusFilter === s ? meta.color : "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>{t(meta.label)}</p>
              </button>
            );
          })}
        </div>

        {/* Filter mode tabs */}
        <div style={{
          display: "flex", gap: "0.75rem", marginBottom: "1.25rem",
          borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem",
        }}>
          {[
            { value: "all", label: "allOrders" },
            { value: "available", label: "available" },
            { value: "my-orders", label: "myAssignedOrders" },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setFilterMode(tab.value); setPage(1); }}
              style={{
                padding: "0.5rem 1rem", borderBottom: filterMode === tab.value ? `2px solid var(--primary)` : "none",
                color: filterMode === tab.value ? "var(--primary)" : "var(--text-muted)",
                background: "transparent", border: "none", cursor: "pointer",
                fontSize: "0.875rem", fontWeight: filterMode === tab.value ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>

        {/* Filters + search */}
        <div style={{
          background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)",
          padding: "1rem 1.5rem", marginBottom: "1.25rem",
          display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
        }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <svg style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text" placeholder={t("search")}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: "100%", padding: "0.55rem 0.875rem 0.55rem 2.25rem",
                border: "1px solid var(--border)", borderRadius: "8px",
                fontSize: "0.875rem", background: "var(--bg)", color: "var(--text)",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              padding: "0.55rem 1rem", border: "1px solid var(--border)",
              borderRadius: "8px", background: "var(--bg)", color: "var(--text)",
              fontSize: "0.875rem", outline: "none", cursor: "pointer",
            }}
          >
            <option value="">{t("allStatuses")}</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{t(STATUS_META[s].label)}</option>)}
          </select>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(""); setStatusFilter(""); setPage(1); }}
              style={{ color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
              Clear
            </button>
          )}
        </div>

        {/* Orders table */}
        <div style={{
          background: "var(--surface)", borderRadius: "16px", border: "1px solid var(--border)",
          overflow: "hidden",
        }}>
          {error && (
            <div style={{ padding: "1rem 1.5rem", background: "var(--danger-bg)", color: "var(--danger)", fontSize: "0.875rem" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 1fr 1fr",
            padding: "0.75rem 1.5rem", borderBottom: "1px solid var(--border)",
          }}>
            {["Device/Issue", t("status"), t("created"), t("repairCost"), "Action"].map((h, i) => (
              <p key={i} style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</p>
            ))}
          </div>

          {loadingOrders ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <p style={{ fontSize: "2rem", margin: "0 0 0.75rem" }}>🔍</p>
              <p style={{ color: "var(--text-muted)", fontWeight: 600 }}>{t("noResults")}</p>
            </div>
          ) : (
            orders.map((order, i) => (
              <MasterOrderRow
                key={order.id}
                order={order}
                user={user}
                isLast={i === orders.length - 1}
                onEdit={() => router.push(`/master/order/${order.id}`)}
                t={t}
              />
            ))
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{
              padding: "1rem 1.5rem", borderTop: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {pagination.total} · {t("page")} {pagination.page} {t("of")} {pagination.totalPages}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: "0.4rem 0.9rem", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--bg)", color: page === 1 ? "var(--text-faint)" : "var(--text-muted)", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: "0.85rem" }}>
                  ← {t("prevPage")}
                </button>
                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                  style={{ padding: "0.4rem 0.9rem", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--bg)", color: page === pagination.totalPages ? "var(--text-faint)" : "var(--text-muted)", cursor: page === pagination.totalPages ? "not-allowed" : "pointer", fontSize: "0.85rem" }}>
                  {t("nextPage")} →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MasterOrderRow({ order, user, isLast, onEdit, t }) {
  return (
    <div
      style={{
        display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 1fr 1fr",
        padding: "1rem 1.5rem",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        alignItems: "center", cursor: "pointer", transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--surface-secondary)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div>
        <p style={{ fontWeight: 700, color: "var(--text)", margin: 0, fontSize: "0.9rem" }}>{order.deviceModel}</p>
        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>
          {order.issueDescription}
        </p>
        <p style={{ color: "var(--primary-light)", margin: "0.25rem 0 0 0", fontSize: "0.75rem", fontWeight: 500 }}>
          👤 {order.clientUsername}
        </p>
      </div>
      <StatusBadge status={order.status} t={t} />
      <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.8rem" }}>{new Date(order.createdAt).toLocaleDateString()}</p>
      <p style={{ color: order.cost ? "var(--success)" : "var(--text-faint)", margin: 0, fontSize: "0.8rem", fontWeight: 600 }}>
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
              padding: "0.35rem 0.75rem", background: "var(--primary)",
              border: "none", borderRadius: "6px", color: "var(--text-on-primary)",
              cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {t("claim")}
          </button>
        ) : order.assignedTo === user.id ? (
          <button
            onClick={() => onEdit()}
            style={{
              padding: "0.35rem 0.85rem", background: "var(--primary-bg)",
              border: "1px solid var(--primary)", borderRadius: "6px",
              color: "var(--primary-light)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
              width: "fit-content", whiteSpace: "nowrap",
            }}
          >
            {t("edit")} →
          </button>
        ) : null}
      </div>
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