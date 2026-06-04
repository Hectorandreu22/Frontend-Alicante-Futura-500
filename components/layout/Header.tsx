"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n, flags, type Locale } from "@/lib/i18n";
import { getAppointments } from "@/lib/api";

const languages: { locale: Locale; label: string }[] = [
  { locale: "es", label: "Español" },
  { locale: "fr", label: "Français" },
  { locale: "de", label: "Deutsch" },
  { locale: "it", label: "Italiano" },
  { locale: "en", label: "English" },
  { locale: "ht", label: "Kreyòl" },
];

function decodeJwt(token: string): { email?: string; sub?: number; name?: string } | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function IconSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M13.5 10A6 6 0 1 1 6 2.5a5 5 0 0 0 7.5 7.5z" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="14" height="12" rx="2" />
      <path d="M5 1v4M11 1v4M1 7h14" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1a5 5 0 0 1 5 5c0 5 1.5 6 1.5 6h-13S3 11 3 6a5 5 0 0 1 5-5z" />
      <path d="M6.5 13a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <circle cx="7" cy="7" r="5" />
      <path d="M13 13l-3-3" />
    </svg>
  );
}
function IconExport() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1v10M4 7l4 4 4-4" />
      <path d="M2 13h12" />
    </svg>
  );
}

// ── Exportar PDF via ventana de impresión ─────────────────────────────────────

function exportToPDF(rows: {
  id: number; date: string; time: string; status: string;
  customerId: number; businessId: number; serviceName: string;
}[]) {
  const statusLabel = (s: string) =>
    s === "pending" ? "Pendiente" : s === "confirmed" ? "Confirmada" : "Pagada";

  const statusColor = (s: string) =>
    s === "pending" ? "#854d0e" : s === "confirmed" ? "#15803d" : "#1e40af";

  const statusBg = (s: string) =>
    s === "pending" ? "#fef9c3" : s === "confirmed" ? "#dcfce7" : "#dbeafe";

  const today = new Date().toLocaleDateString("es-ES", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const rows_html = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>${r.serviceName}</td>
      <td>${r.customerId}</td>
      <td>${r.businessId}</td>
      <td>
        <span style="
          display: inline-block;
          padding: 2px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          background: ${statusBg(r.status)};
          color: ${statusColor(r.status)};
        ">${statusLabel(r.status)}</span>
      </td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>BookFlow — Informe de reservas</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 13px;
          color: #0f172a;
          background: #fff;
          padding: 40px 48px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 2px solid #0f172a;
        }
        .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.04em; color: #0f172a; }
        .brand-sub { font-size: 12px; color: #64748b; margin-top: 3px; }
        .meta { text-align: right; font-size: 12px; color: #64748b; line-height: 1.6; }
        .meta strong { color: #0f172a; }
        h2 {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 14px;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        thead tr {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          padding: 9px 12px;
          text-align: left;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748b;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #0f172a;
          vertical-align: middle;
        }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:hover td { background: #f8fafc; }
        .footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          font-size: 11px;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          body { padding: 20px 28px; }
          @page { margin: 0; size: A4 landscape; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">BookFlow</div>
          <div class="brand-sub">Admin workspace</div>
        </div>
        <div class="meta">
          <div><strong>Informe de reservas</strong></div>
          <div>Generado el ${today}</div>
          <div>Total: ${rows.length} reservas</div>
        </div>
      </div>

      <h2>Listado completo de reservas</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Servicio</th>
            <th>Cliente ID</th>
            <th>Negocio ID</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${rows_html}
        </tbody>
      </table>

      <div class="footer">
        <span>BookFlow — Plataforma de gestión de reservas y cobros</span>
        <span>${today}</span>
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() { window.close(); };
        };
      </script>
    </body>
    </html>
  `;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Activa las ventanas emergentes para generar el PDF.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function Header() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [dark, setDark]               = useState(false);
  const [langOpen, setLangOpen]       = useState(false);
  const [userOpen, setUserOpen]       = useState(false);
  const [userName, setUserName]       = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState("A");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [exporting, setExporting]     = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      const name = payload?.name ?? payload?.email ?? null;
      setUserName(name);
      if (name) setUserInitial(name.charAt(0).toUpperCase());
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
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) setUserOpen(false);
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

  async function handleExport() {
    setExporting(true);
    try {
      const data = await getAppointments();
      exportToPDF(data);
    } catch {
      alert("No se pudo obtener los datos. Comprueba que el backend está activo.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <header className="admin-header">
        <div className="admin-header__left">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="admin-header__title">{t("appTitle")}</span>
            <span className="admin-header__subtitle">{t("appSubtitle")}</span>
          </div>

          <div className="admin-header__search">
            <span className="admin-header__search-icon"><IconSearch /></span>
            <input type="search" placeholder="Buscar..." aria-label="Buscar" />
          </div>
        </div>

        <div className="admin-header__actions">
          <button
            type="button"
            className="admin-header__icon-btn"
            title="Calendario"
            aria-label="Abrir calendario"
            onClick={() => router.push("/calendar")}
          >
            <IconCalendar />
          </button>

          <button
            type="button"
            className="admin-header__icon-btn"
            title="Notificaciones"
            aria-label="Notificaciones"
          >
            <IconBell />
          </button>

          <button
            type="button"
            className="admin-header__icon-btn"
            onClick={toggleDark}
            title={dark ? "Modo claro" : "Modo oscuro"}
            aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
          >
            {dark ? <IconSun /> : <IconMoon />}
          </button>

          <div ref={langDropdownRef} style={{ position: "relative" }}>
            <button
              type="button"
              className="admin-header__icon-btn"
              onClick={() => setLangOpen((o) => !o)}
              title="Idioma"
              aria-label="Seleccionar idioma"
              style={{ fontSize: 16, width: 34, height: 34 }}
            >
              {flags[locale]}
            </button>
            {langOpen && (
              <div className="dropdown-menu" style={{ minWidth: 160 }}>
                {languages.map(({ locale: l, label }) => (
                  <button
                    key={l}
                    type="button"
                    className="dropdown-item"
                    onClick={() => { setLocale(l); setLangOpen(false); }}
                    style={{ fontWeight: locale === l ? 700 : 400 }}
                  >
                    <span style={{ fontSize: 18 }}>{flags[l]}</span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="header-cta-btn"
            onClick={handleExport}
            disabled={exporting}
          >
            <IconExport />
            {exporting ? "Generando..." : t("exportReport")}
          </button>
        </div>
      </header>

      {showLogoutConfirm && (
        <div className="modal-backdrop" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🚪</div>
            <p className="modal-title">¿Cerrar sesión?</p>
            <p className="modal-text">Serás redirigido a la pantalla de inicio de sesión.</p>
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setShowLogoutConfirm(false)}>
                Cancelar
              </button>
              <button type="button" className="danger-btn" onClick={handleLogout}>
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
