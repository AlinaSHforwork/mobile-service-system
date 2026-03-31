"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { ordersAPI } from "@/lib/api";

const DEVICE_TYPES = ["Smartphone", "Tablet", "Smartwatch", "Feature Phone", "Other"];

export default function CreateOrderPage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [form, setForm] = useState({
    deviceType: "Smartphone",
    deviceModel: "",
    osVersion: "",
    dateOfPurchase: "",
    issueDescription: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (user.role === "master") router.replace("/master");
    }
  }, [user, loading, router]);

  const validate = () => {
    const e = {};
    if (!form.deviceModel.trim()) e.deviceModel = t("deviceModelRequired");
    if (!form.osVersion.trim()) e.osVersion = t("osVersionRequired");
    if (!form.issueDescription.trim()) e.issueDescription = t("issueDescriptionRequired");
    else if (form.issueDescription.trim().length < 10) e.issueDescription = t("issueTooShort");
    return e;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const res = await ordersAPI.create({
        ...form,
        dateOfPurchase: form.dateOfPurchase || null,
      });
      if (res.success) {
        router.push("/client");
      } else if (res.errors) {
        const fe = {};
        res.errors.forEach(e => { fe[e.path] = e.msg; });
        setErrors(fe);
      } else {
        setServerError(res.message || t("networkError"));
      }
    } catch {
      setServerError(t("networkError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return <LoadingScreen />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
      {/* Nav */}
      <header style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "0 2rem", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "var(--nav-shadow)",
        position: "sticky", top: 0, zIndex: 10, paddingRight: "70px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "10px",
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <circle cx="12" cy="18" r="1" fill="white" stroke="none" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text)", letterSpacing: "-0.02em" }}>
            {t("appName")}
          </span>
        </div>
        <Link href="/client" style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          color: "var(--text-muted)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500,
        }}>
          ← {t("back")}
        </Link>
      </header>

      <main style={{ padding: "2rem", maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
            {t("newRepairOrder")}
          </h1>
          <p style={{ color: "var(--text-faint)", margin: "0.4rem 0 0", fontSize: "0.9rem" }}>
            {t("fillDetails")}
          </p>
        </div>

        {serverError && (
          <div style={{
            background: "var(--danger-bg)", border: "1px solid var(--danger)",
            borderRadius: "10px", padding: "0.875rem 1.25rem",
            color: "var(--danger)", fontSize: "0.875rem", marginBottom: "1.25rem",
            display: "flex", alignItems: "center", gap: "0.5rem",
          }}>
            ⚠️ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{
            background: "var(--surface)", borderRadius: "16px",
            boxShadow: "var(--shadow-md)", border: "1px solid var(--border)",
            padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem",
          }}>
            <SectionLabel>{t("deviceInfo")}</SectionLabel>

            {/* Device type */}
            <FormField label={t("deviceType")} required>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {DEVICE_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleChange("deviceType", type)}
                    style={{
                      padding: "0.45rem 1rem", borderRadius: "8px", fontSize: "0.85rem",
                      fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                      border: form.deviceType === type ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                      background: form.deviceType === type ? "var(--primary-bg)" : "var(--surface)",
                      color: form.deviceType === type ? "var(--primary)" : "var(--text-muted)",
                    }}
                  >{type}</button>
                ))}
              </div>
            </FormField>

            {/* Model */}
            <FormField label={t("deviceModel")} required error={errors.deviceModel}>
              <input
                type="text"
                value={form.deviceModel}
                onChange={e => handleChange("deviceModel", e.target.value)}
                placeholder={t("deviceModelPlaceholder")}
                style={inputStyle(!!errors.deviceModel)}
              />
            </FormField>

            {/* OS + Date grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <FormField label={t("osVersion")} required error={errors.osVersion}>
                <input
                  type="text"
                  value={form.osVersion}
                  onChange={e => handleChange("osVersion", e.target.value)}
                  placeholder={t("osVersionPlaceholder")}
                  style={inputStyle(!!errors.osVersion)}
                />
              </FormField>
              <FormField label={t("dateOfPurchase")} error={errors.dateOfPurchase}>
                <input
                  type="date"
                  value={form.dateOfPurchase}
                  onChange={e => handleChange("dateOfPurchase", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  style={inputStyle(false)}
                />
              </FormField>
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />
            <SectionLabel>{t("issueDetails")}</SectionLabel>

            {/* Issue description */}
            <FormField label={t("describeProblem")} required error={errors.issueDescription}>
              <textarea
                value={form.issueDescription}
                onChange={e => handleChange("issueDescription", e.target.value)}
                placeholder={t("describeIssuePlaceholder")}
                rows={5}
                style={{
                  ...inputStyle(!!errors.issueDescription),
                  resize: "vertical", minHeight: "120px",
                }}
              />
              <div style={{ fontSize: "0.75rem", color: form.issueDescription.length < 10 ? "var(--warning)" : "var(--success)", textAlign: "right", marginTop: "0.25rem" }}>
                {form.issueDescription.length} / min 10 chars
              </div>
            </FormField>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
            <Link href="/client" style={{
              padding: "0.65rem 1.5rem", border: "1px solid var(--border)",
              borderRadius: "8px", background: "var(--surface)", color: "var(--text-muted)",
              textDecoration: "none", fontWeight: 600, fontSize: "0.9rem",
              display: "flex", alignItems: "center",
            }}>
              {t("cancel")}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "0.65rem 2rem",
                background: submitting ? "var(--primary-light)" : "linear-gradient(135deg, var(--primary), var(--accent))",
                color: "white", border: "none", borderRadius: "8px",
                fontWeight: 700, fontSize: "0.9rem",
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}
            >
              {submitting ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  {t("submitting")}
                </>
              ) : t("submit") + " →"}
            </button>
          </div>
        </form>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {children}
    </p>
  );
}

function FormField({ label, required, error, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.4rem" }}>
        {label} {required && <span style={{ color: "var(--danger)" }}>*</span>}
      </label>
      {children}
      {error && <p style={{ color: "var(--danger)", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>{error}</p>}
    </div>
  );
}

function inputStyle(hasError) {
  return {
    width: "100%", padding: "0.625rem 0.875rem",
    border: `1px solid ${hasError ? "var(--danger)" : "var(--border)"}`,
    borderRadius: "8px", fontSize: "0.9rem", outline: "none",
    color: "var(--text)", background: hasError ? "var(--danger-bg)" : "var(--input-bg)",
    boxSizing: "border-box", transition: "border-color 0.15s",
    fontFamily: "inherit",
  };
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}