"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { ordersAPI } from "@/lib/api";

const STATUS_META = {
  "new": { label: "statusNew", color: "var(--badge-new-color)", bg: "var(--badge-new-bg)" },
  "waiting customer response": { label: "statusAwaitingResponse", color: "var(--badge-awaiting-color)", bg: "var(--badge-awaiting-bg)" },
  "waiting spare parts": { label: "statusAwaitingParts", color: "var(--badge-parts-color)", bg: "var(--badge-parts-bg)" },
  "in progress": { label: "statusInProgress", color: "var(--badge-inprogress-color)", bg: "var(--badge-inprogress-bg)" },
  "failed": { label: "statusFailed", color: "var(--badge-failed-color)", bg: "var(--badge-failed-bg)" },
  "done": { label: "statusDone", color: "var(--badge-done-color)", bg: "var(--badge-done-bg)" },
};

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

export default function ClientPage() {
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
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
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
      {/* Top nav */}
      <header style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "0 2rem", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "var(--nav-shadow)",
        position: "sticky", top: 0, zIndex: 10,
        paddingRight: "70px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "10px",
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <circle cx="12" cy="18" r="1" fill="white" stroke="none" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text)", letterSpacing: "-0.02em" }}>
            {t("appName")}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/client/create-order" style={{
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            color: "white", padding: "0.5rem 1.25rem",
            borderRadius: "8px", textDecoration: "none", fontWeight: 700,
            fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem",
          }}>
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span> {t("newOrder")}
          </Link>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{user.username}</p>
            <p style={{ fontSize: "0.72rem", color: "var(--primary)", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("client")}</p>
          </div>
          <button onClick={handleLogout} style={{
            padding: "0.45rem 0.9rem", border: "1px solid var(--border)",
            borderRadius: "8px", background: "var(--surface)", color: "var(--text-muted)",
            fontSize: "0.875rem", cursor: "pointer", fontWeight: 500,
          }}>{t("signOut")}</button>
        </div>
      </header>

      <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        {/* Stats cards */}
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {[
            { label: t("totalOrders"), value: pagination.total, icon: "📋" },
            { label: t("inProgress"), value: orders.filter(o => o.status === "in progress").length, icon: "⚙️" },
            { label: t("completed"), value: orders.filter(o => o.status === "done").length, icon: "✅" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "var(--surface)", borderRadius: "12px", padding: "1.25rem",
              boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: "1rem",
            }}>
              <span style={{ fontSize: "1.75rem" }}>{stat.icon}</span>
              <div>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", margin: 0 }}>{stat.value}</p>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0, fontWeight: 500 }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Orders container */}
        <div style={{
          background: "var(--surface)", borderRadius: "16px",
          boxShadow: "var(--shadow-md)", border: "1px solid var(--border)",
          overflow: "hidden",
        }}>
          {/* Header row */}
          <div style={{
            padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--bg)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
          }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", margin: 0 }}>{t("myOrders")}</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-faint)", margin: 0 }}>{pagination.total} {t("totalOrders")}</p>
            </div>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder={t("search")}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{
                  padding: "0.5rem 0.875rem 0.5rem 2.25rem", border: "1px solid var(--border)",
                  borderRadius: "8px", fontSize: "0.875rem", outline: "none", width: "220px",
                  color: "var(--text)",
                  background: "var(--input-bg)",
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
              <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
              <h3 style={{ color: "var(--text)", fontWeight: 700, margin: "0 0 0.5rem" }}>{t("noOrdersYet")}</h3>
              <p style={{ color: "var(--text-faint)", margin: "0 0 1.5rem" }}>
                {search ? t("noOrdersSearch") : t("createFirst")}
              </p>
              {!search && (
                <Link href="/client/create-order" style={{
                  background: "linear-gradient(135deg, var(--primary), var(--accent))",
                  color: "white", padding: "0.65rem 1.5rem",
                  borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem",
                }}>
                  + {t("newOrder")}
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
                  t={t}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{
              padding: "1rem 1.5rem",
              background: "var(--bg)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}>
                {t("page")} {pagination.page} {t("of")} {pagination.totalPages}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: "0.4rem 0.9rem", border: "1px solid var(--border)", borderRadius: "6px",
                    background: "var(--surface)", color: page === 1 ? "var(--text-faint)" : "var(--text)",
                    cursor: page === 1 ? "not-allowed" : "pointer", fontSize: "0.85rem", fontWeight: 500,
                  }}
                >{t("prevPage")}</button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  style={{
                    padding: "0.4rem 0.9rem", border: "1px solid var(--border)", borderRadius: "6px",
                    background: "var(--surface)", color: page === pagination.totalPages ? "var(--text-faint)" : "var(--text)",
                    cursor: page === pagination.totalPages ? "not-allowed" : "pointer", fontSize: "0.85rem", fontWeight: 500,
                  }}
                >{t("nextPage")}</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function OrderRow({ order, isLast, onDelete, deleting, t }) {
  const router = useRouter();
  const canDelete = order.status === "new";

  return (
    <div
      style={{
        padding: "1.25rem 1.5rem",
        borderBottom: isLast ? "none" : "1px solid var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "1rem", flexWrap: "wrap",
        cursor: "pointer", transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--surface-secondary)"}
      onMouseLeave={e => e.currentTarget.style.background = "var(--surface)"}
      onClick={() => router.push(`/client/order/${order.id}`)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0 }}>
        <div style={{
          width: 42, height: 42, borderRadius: "10px",
          background: "linear-gradient(135deg, var(--primary-bg), var(--primary-bg-strong))",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <circle cx="12" cy="18" r="1" fill="var(--primary)" stroke="none" />
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 700, color: "var(--text)", margin: 0, fontSize: "0.95rem" }}>
            {order.deviceModel}
          </p>
          <p style={{ color: "var(--text-faint)", margin: 0, fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "320px" }}>
            {order.issueDescription}
          </p>
          {order.masterName && (
            <p style={{ color: "var(--accent)", margin: "0.25rem 0 0 0", fontSize: "0.75rem", fontWeight: 500 }}>
              🔧 {order.masterName}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexShrink: 0 }}>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-faint)", margin: 0 }}>{order.deviceType} • {order.osVersion}</p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-faint)", margin: 0 }}>
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={order.status} t={t} />
        <div style={{ display: "flex", gap: "0.4rem" }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => router.push(`/client/order/${order.id}`)}
            style={{
              padding: "0.35rem 0.75rem", border: "1px solid var(--border)", borderRadius: "6px",
              background: "var(--surface)", color: "var(--primary)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
            }}
          >{t("view")}</button>
          {canDelete && (
            <button
              onClick={() => onDelete()}
              disabled={deleting}
              style={{
                padding: "0.35rem 0.75rem", border: "1px solid var(--danger-bg)", borderRadius: "6px",
                background: "var(--danger-bg)", color: "var(--danger)", cursor: deleting ? "not-allowed" : "pointer",
                fontSize: "0.8rem", fontWeight: 600, opacity: deleting ? 0.6 : 1,
              }}
            >{deleting ? "..." : t("delete")}</button>
          )}
        </div>
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