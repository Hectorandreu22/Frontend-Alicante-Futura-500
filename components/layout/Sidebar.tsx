"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

const Icons = {
  dashboard: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="7" height="7" rx="1.5" />
      <rect x="10" y="1" width="7" height="7" rx="1.5" />
      <rect x="1" y="10" width="7" height="7" rx="1.5" />
      <rect x="10" y="10" width="7" height="7" rx="1.5" />
    </svg>
  ),
  bookings: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="14" height="13" rx="2" />
      <path d="M6 1v4M12 1v4M2 8h14" />
    </svg>
  ),
  customers: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="6" r="3.5" />
      <path d="M1.5 16c0-3.314 3.358-6 7.5-6s7.5 2.686 7.5 6" />
    </svg>
  ),
  payments: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="16" height="11" rx="2" />
      <path d="M1 8h16M5 12h2M9 12h4" />
    </svg>
  ),
  businesses: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17V8l6-6 6 6v9" />
      <rect x="6" y="11" width="6" height="6" rx="1" />
    </svg>
  ),
<<<<<<< HEAD
star: (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 1l2.5 5 5.5.8-4 3.9.9 5.5L9 13.5l-4.9 2.6.9-5.5L1 7.8l5.5-.8z" />
  </svg>
),

=======
>>>>>>> main
  settings: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="2.5" />
      <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.42 1.42M13.36 13.36l1.42 1.42M3.22 14.78l1.42-1.42M13.36 4.64l1.42-1.42" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l4 4 4-4" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="6" r="3.5" />
      <path d="M1.5 16c0-3.314 3.358-6 7.5-6s7.5 2.686 7.5 6" />
    </svg>
  ),
  workspace: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="14" height="14" rx="2" />
      <path d="M2 7h14" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1a5 5 0 0 1 5 5c0 5 1.5 6 1.5 6h-13S3 11 3 6a5 5 0 0 1 5-5z" />
      <path d="M7 14a2 2 0 0 0 4 0" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 2H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4" />
      <path d="M12 13l4-4-4-4" />
      <path d="M16 9H7" />
    </svg>
  ),
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const mainItems = [
<<<<<<< HEAD
    { label: t("navDashboard"),  href: "/dashboard",  icon: Icons.dashboard  },
    { label: t("navBookings"),   href: "/bookings",   icon: Icons.bookings   },
    { label: t("navCustomers"),  href: "/customers",  icon: Icons.customers  },
    { label: t("navPayments"),   href: "/payments",   icon: Icons.payments   },
    { label: t("navBusinesses"), href: "/businesses", icon: Icons.businesses },
    { label: "Reseñas", href: "/reviews", icon: Icons.star },
  ];

  const settingsSubItems = [
    { label: t("settingsProfile"),       href: "/settings/profile",       icon: Icons.profile   },
    { label: t("settingsWorkspace"),     href: "/settings/workspace",     icon: Icons.workspace },
    { label: t("settingsNotifications"), href: "/settings/notifications", icon: Icons.bell      },
=======
    { label: t("navDashboard"), href: "/dashboard", icon: Icons.dashboard },
    { label: t("navBookings"), href: "/bookings", icon: Icons.bookings },
    { label: t("navCustomers"), href: "/customers", icon: Icons.customers },
    { label: t("navPayments"), href: "/payments", icon: Icons.payments },
    { label: t("navBusinesses"), href: "/businesses", icon: Icons.businesses },
  ];

  const settingsSubItems = [
    { label: t("settingsProfile"), href: "/settings/profile", icon: Icons.profile },
    { label: t("settingsWorkspace"), href: "/settings/workspace", icon: Icons.workspace },
    { label: t("settingsNotifications"), href: "/settings/notifications", icon: Icons.bell },
>>>>>>> main
  ];

  const isSettingsActive = pathname.startsWith("/settings");

  function handleLogout() {
    localStorage.removeItem("token");
    router.replace("/login");
  }

  return (
    <>
      <aside className="admin-sidebar">
<<<<<<< HEAD
        {/* Brand */}
=======
>>>>>>> main
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo" aria-hidden="true">
            <div className="admin-sidebar__logo-inner" />
          </div>
          <span className="admin-sidebar__title">BookFlow</span>
        </div>

<<<<<<< HEAD
        {/* Main nav */}
=======
>>>>>>> main
        <p className="admin-sidebar__section-label">{t("sectionMain")}</p>
        <nav className="admin-sidebar__nav">
          {mainItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar__link${isActive ? " admin-sidebar__link--active" : ""}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

<<<<<<< HEAD
        {/* Bottom section */}
        <p className="admin-sidebar__section-label" style={{ marginTop: 24 }}>{t("sectionSystem")}</p>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>

          {/* Settings toggle */}
=======
        <p className="admin-sidebar__section-label" style={{ marginTop: 24 }}>{t("sectionSystem")}</p>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
>>>>>>> main
          <button
            type="button"
            onClick={() => setSettingsOpen((o) => !o)}
            className={`admin-sidebar__link${isSettingsActive ? " admin-sidebar__link--active" : ""}`}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              justifyContent: "space-between",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="sidebar-icon">{Icons.settings}</span>
              <span>{t("navSettings")}</span>
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                opacity: 0.5,
                transition: "transform 0.2s ease",
                transform: settingsOpen ? "rotate(180deg)" : "rotate(0deg)",
                width: 14,
                height: 14,
              }}
            >
              {Icons.chevron}
            </span>
          </button>

<<<<<<< HEAD
          {/* Settings sub-panel */}
=======
>>>>>>> main
          {settingsOpen && (
            <div
              style={{
                margin: "2px 0 4px 16px",
                padding: "6px 8px",
                background: "var(--surface-2, color-mix(in srgb, var(--surface) 60%, var(--border)))",
                borderRadius: 8,
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {settingsSubItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`admin-sidebar__link${isActive ? " admin-sidebar__link--active" : ""}`}
                    style={{ fontSize: 12.5, padding: "6px 10px", gap: 8 }}
                  >
                    <span className="sidebar-icon" style={{ width: 14, height: 14 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}

<<<<<<< HEAD
              {/* Divider */}
              <div style={{ height: 1, background: "var(--border)", margin: "4px 2px" }} />

              {/* Logout button */}
=======
              <div style={{ height: 1, background: "var(--border)", margin: "4px 2px" }} />

>>>>>>> main
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="admin-sidebar__link"
                style={{
                  fontSize: 12.5,
                  padding: "6px 10px",
                  gap: 8,
                  width: "100%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "var(--danger, #e53e3e)",
                }}
              >
                <span className="sidebar-icon" style={{ width: 14, height: 14, color: "var(--danger, #e53e3e)" }}>
                  {Icons.logout}
                </span>
                <span>{t("logoutLabel")}</span>
              </button>
            </div>
          )}
        </nav>

<<<<<<< HEAD
        {/* User footer */}
=======
>>>>>>> main
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">A</div>
            <div className="admin-sidebar__user-info">
              <p className="admin-sidebar__user-name">Admin</p>
              <p className="admin-sidebar__user-role">workspace</p>
            </div>
          </div>
        </div>
      </aside>

<<<<<<< HEAD
      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div
          className="modal-backdrop"
          onClick={() => setShowLogoutConfirm(false)}
        >
=======
      {showLogoutConfirm && (
        <div className="modal-backdrop" onClick={() => setShowLogoutConfirm(false)}>
>>>>>>> main
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🚪</div>
            <p className="modal-title">{t("logoutConfirmTitle")}</p>
            <p className="modal-text">{t("logoutConfirmText")}</p>
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setShowLogoutConfirm(false)}>
                {t("logoutCancel")}
              </button>
              <button type="button" className="danger-btn" onClick={handleLogout}>
                {t("logoutConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> main
