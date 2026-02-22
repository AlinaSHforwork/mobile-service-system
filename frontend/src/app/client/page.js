"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function ClientPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (user.role === "master") router.replace("/master");
    }
  }, [user, loading, router]);

  if (loading || !user) return <LoadingScreen />;

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header
        style={{
          background: "white",
          borderBottom: "1px solid var(--border)",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <circle cx="12" cy="18" r="1" fill="white" stroke="none" />
            </svg>
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.1rem",
              color: "var(--text)",
            }}
          >
            Repair Service
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text)",
                margin: 0,
              }}
            >
              {user.username}
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                margin: 0,
                textTransform: "capitalize",
              }}
            >
              {user.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              background: "white",
              color: "var(--text-muted)",
              fontSize: "0.875rem",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Content placeholder */}
      <main style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <div
          className="animate-fade-in"
          style={{
            background: "white",
            borderRadius: "1rem",
            padding: "3rem",
            textAlign: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔧</div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: "0.5rem",
            }}
          >
            Client Dashboard
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              maxWidth: "400px",
              margin: "0 auto 1.5rem",
              lineHeight: 1.6,
            }}
          >
            Welcome, <strong>{user.username}</strong>! Your orders and repair
            tracking will appear here. This section is coming soon.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "2rem",
              color: "#16a34a",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            <span>✓</span> Authentication successful — role: client
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid var(--border)",
          borderTop: "3px solid var(--primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
