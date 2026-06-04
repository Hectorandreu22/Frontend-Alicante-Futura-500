"use client";
import { useState, useRef, useEffect } from "react";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "confirmation",
    title: "Confirmación pendiente",
    description: "María López – Peluquería Nova · Corte + peinado",
    time: "Hace 5 min",
    read: false,
  },
  {
    id: 2,
    type: "payment",
    title: "Pago recibido",
    description: "Carlos Pérez – 45€ · Restaurante Marea",
    time: "Hace 22 min",
    read: false,
  },
  {
    id: 3,
    type: "reminder",
    title: "Revisión recomendada",
    description: "3 reservas sin confirmar esta mañana",
    time: "Hace 1 h",
    read: false,
  },
  {
    id: 4,
    type: "booking",
    title: "Nueva reserva",
    description: "Lucía Sánchez – Barber Studio · 12:00",
    time: "Hace 2 h",
    read: true,
  },
  {
    id: 5,
    type: "cancellation",
    title: "Reserva cancelada",
    description: "Pedro García – Restaurante Marea · 14:30",
    time: "Ayer",
    read: true,
  },
];

const TYPE_META = {
  confirmation: { color: "#f59e0b", bg: "#fef3c7", icon: "✓" },
  payment:      { color: "#10b981", bg: "#d1fae5", icon: "€" },
  reminder:     { color: "#3b82f6", bg: "#dbeafe", icon: "!" },
  booking:      { color: "#8b5cf6", bg: "#ede9fe", icon: "📅" },
  cancellation: { color: "#ef4444", bg: "#fee2e2", icon: "✕" },
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    position: "relative",
    display: "inline-block",
    fontFamily: "'DM Sans', sans-serif",
  },
  bellBtn: {
    position: "relative",
    width: 38,
    height: 38,
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "border-color .2s, box-shadow .2s",
  },
  bellBtnActive: {
    border: "1.5px solid #16a34a",
    boxShadow: "0 0 0 3px #bbf7d0",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#ef4444",
    border: "2px solid #fff",
  },
  panel: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    width: 360,
    background: "#fff",
    borderRadius: 16,
    border: "1.5px solid #e5e7eb",
    boxShadow: "0 20px 60px -10px rgba(0,0,0,.15)",
    zIndex: 1000,
    overflow: "hidden",
    animation: "slideDown .18s ease",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px 12px",
    borderBottom: "1px solid #f3f4f6",
  },
  panelTitle: {
    fontWeight: 700,
    fontSize: 15,
    color: "#111827",
    margin: 0,
  },
  markAllBtn: {
    fontSize: 12,
    color: "#16a34a",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    padding: 0,
    fontFamily: "inherit",
  },
  list: {
    maxHeight: 360,
    overflowY: "auto",
    padding: "6px 0",
  },
  item: (read) => ({
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    padding: "12px 20px",
    cursor: "pointer",
    background: read ? "transparent" : "#f9fafb",
    transition: "background .15s",
    borderLeft: read ? "3px solid transparent" : "3px solid #16a34a",
  }),
  iconWrap: (type) => ({
    width: 36,
    height: 36,
    borderRadius: 10,
    background: TYPE_META[type]?.bg ?? "#f3f4f6",
    color: TYPE_META[type]?.color ?? "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  }),
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: (read) => ({
    fontWeight: read ? 500 : 700,
    fontSize: 13,
    color: "#111827",
    margin: "0 0 2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  itemDesc: {
    fontSize: 12,
    color: "#6b7280",
    margin: "0 0 4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemTime: {
    fontSize: 11,
    color: "#9ca3af",
    margin: 0,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#16a34a",
    flexShrink: 0,
    marginTop: 5,
  },
  empty: {
    padding: "32px 20px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 13,
  },
  panelFooter: {
    borderTop: "1px solid #f3f4f6",
    padding: "12px 20px",
    textAlign: "center",
  },
  footerLink: {
    fontSize: 13,
    color: "#16a34a",
    fontWeight: 600,
    textDecoration: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};

const keyframes = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .notif-item:hover { background: #f3f4f6 !important; }
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function NotificationBell({ onViewAll }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAll = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markOne = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.wrapper} ref={ref}>
        {/* Bell button */}
        <button
          style={{ ...styles.bellBtn, ...(open ? styles.bellBtnActive : {}) }}
          onClick={() => setOpen((v) => !v)}
          aria-label="Notificaciones"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={open ? "#16a34a" : "#374151"} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unread > 0 && <span style={styles.badge} />}
        </button>

        {/* Panel */}
        {open && (
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <p style={styles.panelTitle}>
                Notificaciones{" "}
                {unread > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, background: "#dcfce7",
                    color: "#16a34a", borderRadius: 20, padding: "2px 8px", marginLeft: 6,
                  }}>
                    {unread} nuevas
                  </span>
                )}
              </p>
              {unread > 0 && (
                <button style={styles.markAllBtn} onClick={markAll}>
                  Marcar todas como leídas
                </button>
              )}
            </div>

            <div style={styles.list}>
              {notifications.length === 0 ? (
                <p style={styles.empty}>No hay notificaciones</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="notif-item"
                    style={styles.item(n.read)}
                    onClick={() => markOne(n.id)}
                  >
                    <div style={styles.iconWrap(n.type)}>
                      {TYPE_META[n.type]?.icon}
                    </div>
                    <div style={styles.itemContent}>
                      <p style={styles.itemTitle(n.read)}>{n.title}</p>
                      <p style={styles.itemDesc}>{n.description}</p>
                      <p style={styles.itemTime}>{n.time}</p>
                    </div>
                    {!n.read && <div style={styles.dot} />}
                  </div>
                ))
              )}
            </div>

            <div style={styles.panelFooter}>
              <button
                style={styles.footerLink}
                onClick={() => { setOpen(false); onViewAll?.(); }}
              >
                Ver configuración de notificaciones →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
