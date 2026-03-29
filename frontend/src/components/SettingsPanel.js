"use client";

import { useState } from "react";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

export default function SettingsPanel() {
  const { theme, toggleTheme } = useTheme();
  const { lang, switchLang, t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      {/* Gear icon button */}
      <button
        onClick={() => setOpen((p) => !p)}
        title={t("settings")}
        aria-label={t("settings")}
        style={{
          width: 38,
          height: 38,
          borderRadius: "8px",
          border: `1px solid var(--border)`,
          background: "var(--surface)",
          color: "var(--text-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 49 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              zIndex: 50,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "var(--shadow-lg)",
              padding: "1rem",
              minWidth: "200px",
              animation: "fadeIn 0.15s ease",
            }}
          >
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                margin: "0 0 0.75rem",
              }}
            >
              {t("settings")}
            </p>

            {/* Theme */}
            <div style={{ marginBottom: "1rem" }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  margin: "0 0 0.4rem",
                }}
              >
                {t("theme")}
              </p>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {["light", "dark"].map((th) => (
                  <button
                    key={th}
                    onClick={() => theme !== th && toggleTheme()}
                    style={{
                      flex: 1,
                      padding: "0.45rem 0.6rem",
                      borderRadius: "7px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: `1.5px solid ${theme === th ? "var(--primary)" : "var(--border)"}`,
                      background: theme === th ? "var(--primary-bg)" : "transparent",
                      color: theme === th ? "var(--primary)" : "var(--text-muted)",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.3rem",
                    }}
                  >
                    {th === "light" ? "☀️" : "🌙"}{" "}
                    {th === "light" ? t("lightTheme") : t("darkTheme")}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  margin: "0 0 0.4rem",
                }}
              >
                {t("language")}
              </p>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {[
                  { code: "en", label: "English", flag: "🇬🇧" },
                  { code: "uk", label: "Українська", flag: "🇺🇦" },
                ].map(({ code, label, flag }) => (
                  <button
                    key={code}
                    onClick={() => switchLang(code)}
                    style={{
                      flex: 1,
                      padding: "0.45rem 0.6rem",
                      borderRadius: "7px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: `1.5px solid ${lang === code ? "var(--primary)" : "var(--border)"}`,
                      background: lang === code ? "var(--primary-bg)" : "transparent",
                      color: lang === code ? "var(--primary)" : "var(--text-muted)",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.3rem",
                    }}
                  >
                    {flag} {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}