"use client";

import { useEffect, useState, useRef } from "react";
import { useI18n, flags, type Locale } from "@/lib/i18n";

const languages: { locale: Locale; label: string }[] = [
  { locale: "es", label: "Español" },
  { locale: "fr", label: "Français" },
  { locale: "de", label: "Deutsch" },
  { locale: "it", label: "Italiano" },
  { locale: "en", label: "English" },
  { locale: "ht", label: "Kreyòl" },
];

export default function Header() {
  const { t, locale, setLocale } = useI18n();
  const [dark, setDark] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <header className="admin-header">
      <div>
        <h1 className="admin-header__title">{t("appTitle")}</h1>
        <p className="admin-header__subtitle">{t("appSubtitle")}</p>
      </div>
      <div className="admin-header__actions">
        <button type="button" onClick={toggleDark} className="secondary-btn"
          style={{ fontSize: 18, padding: "8px 14px" }}
          title={dark ? t("cancelBtn") : "Modo oscuro"}>
          {dark ? "☀️" : "🌙"}
        </button>

        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button type="button" className="secondary-btn"
            style={{ fontSize: 18, padding: "8px 14px" }}
            onClick={() => setLangOpen((o) => !o)}>
            {flags[locale]}
          </button>
          {langOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              overflow: "hidden", zIndex: 100, minWidth: 160,
            }}>
              {languages.map(({ locale: l, label }) => (
                <button key={l} type="button"
                  onClick={() => { setLocale(l); setLangOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "10px 16px", background: "none",
                    border: "none", cursor: "pointer", fontSize: 14,
                    color: "var(--text)", textAlign: "left",
                    fontWeight: locale === l ? 700 : 400,
                  }}>
                  <span style={{ fontSize: 20 }}>{flags[l]}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}