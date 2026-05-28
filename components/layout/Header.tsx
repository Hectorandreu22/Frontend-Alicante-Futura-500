"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n, flags, type Locale } from "@/lib/i18n";

const languages: { locale: Locale; label: string }[] = [
  { locale: "es", label: "Español" },
  { locale: "fr", label: "Français" },
  { locale: "de", label: "Deutsch" },
  { locale: "it", label: "Italiano" },
  { locale: "en", label: "English" },
  { locale: "ht", label: "Kreyòl" },
];

function decodeJwt(token: string): { email?: string; sub?: number } | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function Header() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      setUserEmail(payload?.email ?? null);
    }
  }, []);

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

  function handleLogout() {
    localStorage.removeItem("token");
    router.replace("/login");
  }

  return (
    <header className="admin-header">
      <div>
        <h1 className="admin-header__title">{t("appTitle")}</h1>
        <p className="admin-header__subtitle">{t("appSubtitle")}</p>
      </div>

      <div className="admin-header__actions">
        <button
          type="button"
          onClick={() => router.push("/calendar")}
          className="secondary-btn icon-btn"
          title="Calendario"
          aria-label="Abrir calendario"
        >
          <CalendarIcon />
        </button>

        <button
          type="button"
          onClick={toggleDark}
          className="secondary-btn icon-btn"
          title={dark ? "Modo claro" : "Modo oscuro"}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Selector de idioma */}
        <div ref={dropdownRef} className="lang-dropdown">
          <button
            type="button"
            className="secondary-btn lang-btn"
            onClick={() => setLangOpen((o) => !o)}
            aria-expanded={langOpen}
          >
            <span className="lang-flag">{flags[locale]}</span>
            <span className="lang-code">{locale.toUpperCase()}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: "transform 0.15s ease", transform: langOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {langOpen && (
            <div className="lang-menu">
              {languages.map(({ locale: l, label }) => (
                <button
                  key={l}
                  type="button"
                  className={`lang-menu__item${locale === l ? " lang-menu__item--active" : ""}`}
                  onClick={() => { setLocale(l); setLangOpen(false); }}
                >
                  <span className="lang-flag">{flags[l]}</span>
                  {label}
                  {locale === l && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "auto" }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {userEmail && (
          <div className="user-pill">
            <span className="user-pill__email">{userEmail}</span>
            <button
              type="button"
              className="user-pill__logout"
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              <LogoutIcon />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
