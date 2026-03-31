"use client";

import SettingsPanel from "./SettingsPanel";

export default function Header() {
  return (
    <header
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 100,
      }}
    >
      <SettingsPanel />
    </header>
  );
}
