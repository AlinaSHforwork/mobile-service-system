"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === "master" ? "/master" : "/client");
    }
  }, [user, loading, router]);

  if (loading) return <LoadingScreen />;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >

      <div className="animate-fade-in" style={{ marginBottom: "1rem" }}>
        <PhoneIcon size={48} color="var(--primary)" />
      </div>

      <h1
        className="animate-fade-in stagger-1"
        style={{
          fontSize: "2.5rem",
          fontWeight: 800,
          color: "var(--text)",
          textAlign: "center",
          marginBottom: "0.75rem",
        }}
      >
        {t("heroTitle")}
      </h1>
      <p
        className="animate-fade-in stagger-2"
        style={{
          color: "var(--text-muted)",
          textAlign: "center",
          maxWidth: "480px",
          lineHeight: 1.6,
          marginBottom: "2.5rem",
        }}
      >
        {t("heroSub")}
      </p>

      <div
        className="animate-fade-in stagger-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          width: "100%",
          maxWidth: "900px",
          marginBottom: "2rem",
        }}
      >
        <FeatureCard
          icon={<WrenchIcon />}
          title={t("expertRepairs")}
          desc={t("expertRepairsDesc")}
        />
        <FeatureCard
          icon={<ClockIcon />}
          title={t("fastService")}
          desc={t("fastServiceDesc")}
        />
        <FeatureCard
          icon={<ShieldIcon />}
          title={t("warrantyIncluded")}
          desc={t("warrantyIncludedDesc")}
        />
      </div>

      <div
        className="animate-fade-in stagger-4"
        style={{
          background: "var(--surface)",
          borderRadius: "1rem",
          padding: "2rem",
          textAlign: "center",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--border)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            color: "var(--text)",
          }}
        >
          {t("ctaTitle")}
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
          }}
        >
          {t("ctaSub")}
        </p>
        <Link
          href="/login"
          style={{
            display: "block",
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            color: "white",
            padding: "0.75rem 2rem",
            borderRadius: "0.5rem",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: "1rem",
          }}
        >
          {t("login")}
        </Link>
        <p
          style={{
            marginTop: "1rem",
            color: "var(--text-muted)",
            fontSize: "0.8rem",
          }}
        >
          {t("newCustomer")}
        </p>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "1rem",
        padding: "1.5rem",
        textAlign: "center",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          color: "var(--primary)",
          marginBottom: "0.75rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem", color: "var(--text)" }}>
        {title}
      </h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
        {desc}
      </p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}

function PhoneIcon({ size = 32, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <circle cx="12" cy="18" r="1" fill={color} stroke="none" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}