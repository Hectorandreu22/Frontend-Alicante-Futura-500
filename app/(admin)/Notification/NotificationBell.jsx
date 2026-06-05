"use client";
import { useState, useRef, useEffect } from "react";

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "confirmation", title: "Confirmación pendiente",  description: "María López – Peluquería Nova · Corte + peinado", time: "Hace 5 min",  read: false },
  { id: 2, type: "payment",      title: "Pago recibido",           description: "Carlos Pérez – 45€ · Restaurante Marea",          time: "Hace 22 min", read: false },
  { id: 3, type: "reminder",     title: "Revisión recomendada",    description: "3 reservas sin confirmar esta mañana",             time: "Hace 1 h",    read: false },
  { id: 4, type: "booking",      title: "Nueva reserva",           description: "Lucía Sánchez – Barber Studio · 12:00",           time: "Hace 2 h",    read: true  },
  { id: 5, type: "cancellation", title: "Reserva cancelada",       description: "Pedro García – Restaurante Marea · 14:30",        time: "Ayer",        read: true  },
];

const TYPE_META = {
  confirmation: { color: "#f59e0b", bg: "#fef3c7", icon: "✓" },
  payment:      { color: "#10b981", bg: "#d1fae5", icon: "€" },
  reminder:     { color: "#3b82f6", bg: "#dbeafe", icon: "!" },
  booking:      { color: "#8b5cf6", bg: "#ede9fe", icon: "📅" },
  cancellation: { color: "#ef4444", bg: "#fee2e2", icon: "✕" },
};

const keyframes = `
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .notif-item:hover { background: var(--surface-2, rgba(0,0,0,.04)) !important; }
`;

export default function NotificationBell({ onViewAll }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAll = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOne = (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <>
      <style>{keyframes}</style>
      <div style={{ position: "relative", display: "inline-block" }} ref={ref}>

        {/* Bell button — usa la misma clase que los otros iconos del header */}
        <button
          className="admin-header__icon-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label="Notificaciones"
          style={{
            position: "relative",
            borderColor: open ? "var(--brand)" : undefined,
            color: open ? "var(--brand)" : undefined,
            boxShadow: open ? "0 0 0 3px var(--brand-soft)" : undefined,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unread > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4,
              width: 8, height: 8, borderRadius: "50%",
              background: "#ef4444",
              border: "2px solid var(--surface)",
            }} />
          )}
        </button>

        {/* Panel */}
        {open && (
          <div style={{
            position: "absolute", top: "calc(100% + 10px)", right: 0,
            width: 360, background: "var(--surface)",
            borderRadius: 16, border: "1.5px solid var(--border)",
            boxShadow: "0 20px 60px -10px rgba(0,0,0,.2)",
            zIndex: 1000, overflow: "hidden",
            animation: "slideDown .18s ease",
          }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px 12px", borderBottom: "1px solid var(--border)",
            }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", margin: 0 }}>
                Notificaciones{" "}
                {unread > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, background: "var(--brand-soft)",
                    color: "var(--brand)", borderRadius: 20, padding: "2px 8px", marginLeft: 6,
                  }}>
                    {unread} nuevas
                  </span>
                )}
              </p>
              {unread > 0 && (
                <button onClick={markAll} style={{
                  fontSize: 12, color: "var(--brand)", background: "none",
                  border: "none", cursor: "pointer", fontWeight: 600,
                  padding: 0, fontFamily: "inherit",
                }}>
                  Marcar todas como leídas
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ maxHeight: 360, overflowY: "auto", padding: "6px 0" }}>
              {notifications.length === 0 ? (
                <p style={{ padding: "32px 20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  No hay notificaciones
                </p>
              ) : notifications.map((n) => (
                <div
                  key={n.id}
                  className="notif-item"
                  onClick={() => markOne(n.id)}
                  style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    padding: "12px 20px", cursor: "pointer",
                    background: n.read ? "transparent" : "var(--brand-soft)",
                    transition: "background .15s",
                    borderLeft: n.read ? "3px solid transparent" : "3px solid var(--brand)",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: TYPE_META[n.type]?.bg ?? "var(--border)",
                    color: TYPE_META[n.type]?.color ?? "var(--muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 14, flexShrink: 0,
                  }}>
                    {TYPE_META[n.type]?.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: n.read ? 500 : 700, fontSize: 13,
                      color: "var(--text)", margin: "0 0 2px",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{n.title}</p>
                    <p style={{
                      fontSize: 12, color: "var(--muted)", margin: "0 0 4px",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{n.description}</p>
                    <p style={{ fontSize: 11, color: "var(--muted-2, var(--muted))", margin: 0 }}>{n.time}</p>
                  </div>
                  {!n.read && (
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "var(--brand)", flexShrink: 0, marginTop: 5,
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ borderTop: "1px solid var(--border)", padding: "12px 20px", textAlign: "center" }}>
              <button
                onClick={() => { setOpen(false); onViewAll?.(); }}
                style={{
                  fontSize: 13, color: "var(--brand)", fontWeight: 600,
                  textDecoration: "none", background: "none", border: "none",
                  cursor: "pointer", fontFamily: "inherit",
                }}
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