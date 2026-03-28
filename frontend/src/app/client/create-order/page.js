"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ordersAPI } from "@/lib/api";

const DEVICE_TYPES = ["Smartphone", "Tablet", "Smartwatch", "Feature Phone", "Other"];

export default function CreateOrderPage() {
  const { user, loading } = useAuth();
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
    if (!form.deviceModel.trim()) e.deviceModel = "Device model is required";
    if (!form.osVersion.trim()) e.osVersion = "OS version is required";
    if (!form.issueDescription.trim()) e.issueDescription = "Issue description is required";
    else if (form.issueDescription.trim().length < 10) e.issueDescription = "Please describe the issue in at least 10 characters";
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
        setServerError(res.message || "Failed to create order");
      }
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
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
          <div style={{
            width: 36, height: 36, borderRadius: "10px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <circle cx="12" cy="18" r="1" fill="white" stroke="none" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#1e1b4b", letterSpacing: "-0.02em" }}>
            Repair Service
          </span>
        </div>
        <Link href="/client" style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          color: "#6b7280", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500,
        }}>
          ← Back to orders
        </Link>
      </header>

      <main style={{ padding: "2rem", maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1e1b4b", margin: 0, letterSpacing: "-0.03em" }}>
            New Repair Order
          </h1>
          <p style={{ color: "#9ca3af", margin: "0.4rem 0 0", fontSize: "0.9rem" }}>
            Fill in the details about your device and the issue
          </p>
        </div>

        {serverError && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: "10px", padding: "0.875rem 1.25rem",
            color: "#ef4444", fontSize: "0.875rem", marginBottom: "1.25rem",
            display: "flex", alignItems: "center", gap: "0.5rem",
          }}>
            ⚠️ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{
            background: "white", borderRadius: "16px",
            boxShadow: "0 1px 12px rgba(0,0,0,0.06)", border: "1px solid #e8eaf0",
            padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem",
          }}>
            <SectionLabel>Device Information</SectionLabel>

            {/* Device type */}
            <FormField label="Device Type" required>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {DEVICE_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleChange("deviceType", type)}
                    style={{
                      padding: "0.45rem 1rem", borderRadius: "8px", fontSize: "0.85rem",
                      fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                      border: form.deviceType === type ? "1.5px solid #6366f1" : "1.5px solid #e8eaf0",
                      background: form.deviceType === type ? "#eef2ff" : "white",
                      color: form.deviceType === type ? "#6366f1" : "#6b7280",
                    }}
                  >{type}</button>
                ))}
              </div>
            </FormField>

            {/* Model */}
            <FormField label="Device Model" required error={errors.deviceModel}>
              <input
                type="text"
                value={form.deviceModel}
                onChange={e => handleChange("deviceModel", e.target.value)}
                placeholder="e.g. Samsung Galaxy S23, iPhone 14 Pro"
                style={inputStyle(!!errors.deviceModel)}
              />
            </FormField>

            {/* OS + Date grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <FormField label="OS Version" required error={errors.osVersion}>
                <input
                  type="text"
                  value={form.osVersion}
                  onChange={e => handleChange("osVersion", e.target.value)}
                  placeholder="e.g. Android 14, iOS 17.2"
                  style={inputStyle(!!errors.osVersion)}
                />
              </FormField>
              <FormField label="Date of Purchase" error={errors.dateOfPurchase}>
                <input
                  type="date"
                  value={form.dateOfPurchase}
                  onChange={e => handleChange("dateOfPurchase", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  style={inputStyle(false)}
                />
              </FormField>
            </div>

            <div style={{ height: "1px", background: "#f0f2fa" }} />
            <SectionLabel>Issue Details</SectionLabel>

            {/* Issue description */}
            <FormField label="Describe the Problem" required error={errors.issueDescription}>
              <textarea
                value={form.issueDescription}
                onChange={e => handleChange("issueDescription", e.target.value)}
                placeholder="Please describe the issue in detail — what happened, when it started, any error messages..."
                rows={5}
                style={{
                  ...inputStyle(!!errors.issueDescription),
                  resize: "vertical", minHeight: "120px",
                }}
              />
              <div style={{ fontSize: "0.75rem", color: form.issueDescription.length < 10 ? "#f59e0b" : "#10b981", textAlign: "right", marginTop: "0.25rem" }}>
                {form.issueDescription.length} / min 10 chars
              </div>
            </FormField>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
            <Link href="/client" style={{
              padding: "0.65rem 1.5rem", border: "1px solid #e8eaf0",
              borderRadius: "8px", background: "white", color: "#6b7280",
              textDecoration: "none", fontWeight: 600, fontSize: "0.9rem",
              display: "flex", alignItems: "center",
            }}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "0.65rem 2rem",
                background: submitting ? "#a5b4fc" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white", border: "none", borderRadius: "8px",
                fontWeight: 700, fontSize: "0.9rem",
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}
            >
              {submitting ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  Submitting...
                </>
              ) : "Submit Order →"}
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
    <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {children}
    </p>
  );
}

function FormField({ label, required, error, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
      {error && <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>{error}</p>}
    </div>
  );
}

function inputStyle(hasError) {
  return {
    width: "100%", padding: "0.625rem 0.875rem",
    border: `1px solid ${hasError ? "#fca5a5" : "#e8eaf0"}`,
    borderRadius: "8px", fontSize: "0.9rem", outline: "none",
    color: "#1e1b4b", background: hasError ? "#fef2f2" : "white",
    boxSizing: "border-box", transition: "border-color 0.15s",
    fontFamily: "inherit",
  };
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2fa" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e8eaf0", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}