"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import SettingsPanel from "@/components/SettingsPanel";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(user.role === "master" ? "/master" : "/client");
    }
  }, [user, authLoading, router]);

  const validate = () => {
    const errors = {};
    if (!username.trim()) errors.username = t("usernameRequired");
    else if (username.length < 3) errors.username = t("usernameTooShort");
    if (!password) errors.password = t("passwordRequired");
    else if (mode === "register" && password.length < 6) errors.password = t("passwordTooShort");
    if (mode === "register" && password !== confirmPassword) errors.confirmPassword = t("passwordMismatch");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors = validate();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setLoading(true);
    try {
      let result;
      if (mode === "login") result = await login(username.trim(), password);
      else result = await register(username.trim(), password);

      if (result.success) {
        router.replace(result.data.user.role === "master" ? "/master" : "/client");
      } else {
        if (result.errors && Array.isArray(result.errors)) {
          const fe = {};
          result.errors.forEach((e) => { fe[e.path] = e.msg; });
          setFieldErrors(fe);
        } else {
          setError(result.message || "Something went wrong");
        }
      }
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <LoadingScreen />;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Settings top-right */}
      <div style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 20 }}>
        <SettingsPanel />
      </div>

      <div
        className="animate-fade-in"
        style={{
          background: "var(--surface)",
          borderRadius: "1.25rem",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary), var(--accent))",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <circle cx="12" cy="18" r="1" fill="white" stroke="none" />
            </svg>
          </div>
        </div>

        <h1 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.25rem" }}>
          {mode === "login" ? t("welcomeBack") : t("createAccount")}
        </h1>
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
          {mode === "login" ? t("signInSub") : t("registerSub")}
        </p>

        {error && (
          <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger)", borderRadius: "0.5rem", padding: "0.75rem 1rem", marginBottom: "1rem", color: "var(--danger)", fontSize: "0.875rem" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate autoComplete="on">
          {/* Username */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.375rem" }}>
              {t("username")}
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                <UserIcon />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setFieldErrors((p) => ({ ...p, username: "" })); }}
                placeholder={t("username")}
                autoComplete="username"
                style={{
                  width: "100%", padding: "0.625rem 0.875rem 0.625rem 2.5rem",
                  border: `1px solid ${fieldErrors.username ? "var(--danger)" : "var(--input-border)"}`,
                  borderRadius: "0.5rem", fontSize: "0.925rem", outline: "none",
                  color: "var(--text)", background: "var(--input-bg)", boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.target.style.borderColor = fieldErrors.username ? "var(--danger)" : "var(--input-border)")}
              />
            </div>
            {fieldErrors.username && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{fieldErrors.username}</p>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: mode === "register" ? "1rem" : "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.375rem" }}>
              {t("password")}
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                <LockIcon />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                placeholder={t("password")}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                style={{
                  width: "100%", padding: "0.625rem 2.75rem 0.625rem 2.5rem",
                  border: `1px solid ${fieldErrors.password ? "var(--danger)" : "var(--input-border)"}`,
                  borderRadius: "0.5rem", fontSize: "0.925rem", outline: "none",
                  color: "var(--text)", background: "var(--input-bg)", boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.target.style.borderColor = fieldErrors.password ? "var(--danger)" : "var(--input-border)")}
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)}
                style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {fieldErrors.password && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{fieldErrors.password}</p>}
          </div>

          {/* Confirm Password */}
          {mode === "register" && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.375rem" }}>
                {t("confirmPassword")}
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: "" })); }}
                  placeholder={t("confirmPassword")}
                  autoComplete="new-password"
                  style={{
                    width: "100%", padding: "0.625rem 0.875rem 0.625rem 2.5rem",
                    border: `1px solid ${fieldErrors.confirmPassword ? "var(--danger)" : "var(--input-border)"}`,
                    borderRadius: "0.5rem", fontSize: "0.925rem", outline: "none",
                    color: "var(--text)", background: "var(--input-bg)", boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.target.style.borderColor = fieldErrors.confirmPassword ? "var(--danger)" : "var(--input-border)")}
                />
              </div>
              {fieldErrors.confirmPassword && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{fieldErrors.confirmPassword}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "0.75rem",
              background: loading ? "var(--primary-light)" : "linear-gradient(135deg, var(--primary), var(--accent))",
              color: "white", border: "none", borderRadius: "0.5rem",
              fontWeight: 700, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              fontFamily: "inherit",
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                {mode === "login" ? t("loggingIn") : t("registering")}
              </>
            ) : mode === "login" ? t("login") : t("register")}
          </button>
        </form>

        {/* Demo credentials */}
        {mode === "login" && (
          <div style={{ marginTop: "1.25rem", padding: "0.75rem", background: "var(--primary-bg)", borderRadius: "0.5rem", textAlign: "center", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>{t("demoCredentials")}</p>
            <p style={{ fontSize: "0.78rem", color: "var(--primary)", margin: "0.125rem 0" }}>{t("masterAccess")}</p>
            <p style={{ fontSize: "0.78rem", color: "var(--primary)", margin: "0.125rem 0" }}>{t("clientAccess")}</p>
          </div>
        )}

        {/* Toggle mode */}
        <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            {mode === "login" ? t("noAccount") : t("hasAccount")}{" "}
          </span>
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setFieldErrors({}); }}
            style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
          >
            {mode === "login" ? t("register") : t("login")}
          </button>
        </div>

        <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
          <Link href="/" style={{ color: "var(--text-muted)", fontSize: "0.8rem", textDecoration: "none" }}>
            {t("backHome")}
          </Link>
        </div>
      </div>
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
function UserIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
function LockIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
}
function EyeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function EyeOffIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
}