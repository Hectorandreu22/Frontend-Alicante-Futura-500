import { useState } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const INITIAL_SETTINGS = {
  channels: {
    email: true,
    sms: false,
    push: true,
  },
  types: [
    {
      id: "new_booking",
      label: "Nueva reserva",
      description: "Cuando un cliente hace una nueva reserva",
      icon: "📅",
      email: true,
      sms: true,
      push: true,
    },
    {
      id: "cancellation",
      label: "Cancelación",
      description: "Cuando se cancela una reserva existente",
      icon: "✕",
      email: true,
      sms: false,
      push: true,
    },
    {
      id: "payment",
      label: "Pago recibido",
      description: "Confirmación de cobros y pagos",
      icon: "€",
      email: true,
      sms: false,
      push: false,
    },
    {
      id: "reminder",
      label: "Recordatorio de reserva",
      description: "Aviso antes de que empiece una reserva",
      icon: "⏰",
      email: false,
      sms: true,
      push: true,
    },
    {
      id: "pending",
      label: "Reserva pendiente",
      description: "Reservas que necesitan confirmación manual",
      icon: "⚠️",
      email: true,
      sms: true,
      push: true,
    },
    {
      id: "review",
      label: "Nueva valoración",
      description: "Cuando un cliente deja una reseña",
      icon: "⭐",
      email: true,
      sms: false,
      push: false,
    },
  ],
  schedule: {
    enabled: true,
    from: "08:00",
    to: "21:00",
    days: ["lun", "mar", "mié", "jue", "vie"],
  },
  reminders: {
    clientReminder: true,
    reminderTime: "24",
    secondReminder: false,
    secondReminderTime: "2",
  },
};

const ALL_DAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#f9fafb",
    minHeight: "100vh",
    padding: "32px 40px",
    color: "#111827",
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 700,
    margin: "0 0 4px",
    color: "#111827",
  },
  headerSub: {
    fontSize: 14,
    color: "#6b7280",
    margin: 0,
  },
  grid: {
    display: "grid",
    gap: 20,
    maxWidth: 820,
  },
  card: {
    background: "#fff",
    borderRadius: 14,
    border: "1.5px solid #e5e7eb",
    padding: "24px 28px",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 20,
  },
  channelRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  channelChip: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 18px",
    borderRadius: 10,
    border: `1.5px solid ${active ? "#16a34a" : "#e5e7eb"}`,
    background: active ? "#f0fdf4" : "#fff",
    cursor: "pointer",
    transition: "all .15s",
    fontSize: 13,
    fontWeight: 600,
    color: active ? "#16a34a" : "#6b7280",
    fontFamily: "inherit",
  }),
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    fontSize: 11,
    fontWeight: 700,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: ".05em",
    padding: "0 0 12px",
    textAlign: "left",
    borderBottom: "1px solid #f3f4f6",
  },
  thCenter: {
    textAlign: "center",
    width: 70,
  },
  tr: (idx) => ({
    borderBottom: "1px solid #f3f4f6",
    background: idx % 2 === 0 ? "#fff" : "#fafafa",
  }),
  tdMain: {
    padding: "14px 0",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  tdCenter: {
    textAlign: "center",
    verticalAlign: "middle",
  },
  typeIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    flexShrink: 0,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111827",
    margin: "0 0 2px",
  },
  typeDesc: {
    fontSize: 11,
    color: "#9ca3af",
    margin: 0,
  },
  toggle: (on) => ({
    width: 36,
    height: 20,
    borderRadius: 10,
    background: on ? "#16a34a" : "#d1d5db",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background .2s",
    display: "inline-block",
    flexShrink: 0,
  }),
  toggleThumb: (on) => ({
    position: "absolute",
    top: 3,
    left: on ? 19 : 3,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#fff",
    transition: "left .2s",
    boxShadow: "0 1px 3px rgba(0,0,0,.2)",
  }),
  scheduleRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    minWidth: 140,
  },
  timeInput: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1.5px solid #e5e7eb",
    fontSize: 13,
    color: "#111827",
    fontFamily: "inherit",
    outline: "none",
    width: 90,
  },
  dayBtn: (active) => ({
    padding: "6px 12px",
    borderRadius: 7,
    border: `1.5px solid ${active ? "#16a34a" : "#e5e7eb"}`,
    background: active ? "#f0fdf4" : "#fff",
    color: active ? "#16a34a" : "#6b7280",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .15s",
  }),
  select: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1.5px solid #e5e7eb",
    fontSize: 13,
    color: "#111827",
    fontFamily: "inherit",
    outline: "none",
    background: "#fff",
  },
  saveBtn: {
    marginTop: 28,
    padding: "12px 32px",
    borderRadius: 10,
    background: "#16a34a",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background .15s, transform .1s",
  },
  savedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    marginLeft: 12,
    fontSize: 13,
    color: "#16a34a",
    fontWeight: 600,
    animation: "fadeIn .3s ease",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
  button:hover { opacity: .88; }
`;

// ─── Toggle component ─────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button style={s.toggle(value)} onClick={() => onChange(!value)} aria-pressed={value}>
      <span style={s.toggleThumb(value)} />
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NotificationsSettings() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [saved, setSaved] = useState(false);

  const toggleChannel = (ch) =>
    setSettings((p) => ({
      ...p,
      channels: { ...p.channels, [ch]: !p.channels[ch] },
    }));

  const toggleType = (id, field) =>
    setSettings((p) => ({
      ...p,
      types: p.types.map((t) =>
        t.id === id ? { ...t, [field]: !t[field] } : t
      ),
    }));

  const toggleDay = (day) => {
    const days = settings.schedule.days.includes(day)
      ? settings.schedule.days.filter((d) => d !== day)
      : [...settings.schedule.days, day];
    setSettings((p) => ({ ...p, schedule: { ...p.schedule, days } }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    // aquí llamarías a tu API: await fetch('/api/notifications/settings', { method:'PUT', body: JSON.stringify(settings) })
  };

  return (
    <>
      <style>{css}</style>
      <div style={s.page}>
        <div style={s.header}>
          <h1 style={s.headerTitle}>Notificaciones</h1>
          <p style={s.headerSub}>
            Configura cómo y cuándo recibes alertas sobre reservas, pagos y clientes.
          </p>
        </div>

        <div style={s.grid}>

          {/* ── Canales ── */}
          <div style={s.card}>
            <p style={s.cardTitle}>Canales de envío</p>
            <p style={s.cardSub}>Elige por dónde quieres recibir las notificaciones</p>
            <div style={s.channelRow}>
              {[
                { id: "email", label: "Email", icon: "✉️" },
                { id: "sms",   label: "SMS",   icon: "💬" },
                { id: "push",  label: "Push",  icon: "🔔" },
              ].map(({ id, label, icon }) => (
                <button
                  key={id}
                  style={s.channelChip(settings.channels[id])}
                  onClick={() => toggleChannel(id)}
                >
                  <span>{icon}</span> {label}
                  {settings.channels[id] && (
                    <span style={{ marginLeft: 4, fontSize: 11 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tipos de notificación ── */}
          <div style={s.card}>
            <p style={s.cardTitle}>Tipos de notificación</p>
            <p style={s.cardSub}>Activa o desactiva cada evento por canal</p>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Evento</th>
                  {["email", "sms", "push"].map((ch) => (
                    <th key={ch} style={{ ...s.th, ...s.thCenter }}>
                      {ch.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {settings.types.map((t, i) => (
                  <tr key={t.id} style={s.tr(i)}>
                    <td>
                      <div style={s.tdMain}>
                        <div style={s.typeIcon}>{t.icon}</div>
                        <div>
                          <p style={s.typeLabel}>{t.label}</p>
                          <p style={s.typeDesc}>{t.description}</p>
                        </div>
                      </div>
                    </td>
                    {["email", "sms", "push"].map((ch) => (
                      <td key={ch} style={s.tdCenter}>
                        <Toggle
                          value={t[ch] && settings.channels[ch]}
                          onChange={() => toggleType(t.id, ch)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Horario ── */}
          <div style={s.card}>
            <p style={s.cardTitle}>Horario de notificaciones</p>
            <p style={s.cardSub}>Solo recibirás alertas en el rango horario seleccionado</p>

            <div style={s.scheduleRow}>
              <span style={s.label}>Activar horario</span>
              <Toggle
                value={settings.schedule.enabled}
                onChange={(v) =>
                  setSettings((p) => ({ ...p, schedule: { ...p.schedule, enabled: v } }))
                }
              />
            </div>

            {settings.schedule.enabled && (
              <>
                <div style={s.scheduleRow}>
                  <span style={s.label}>Desde</span>
                  <input
                    type="time"
                    style={s.timeInput}
                    value={settings.schedule.from}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        schedule: { ...p.schedule, from: e.target.value },
                      }))
                    }
                  />
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>hasta</span>
                  <input
                    type="time"
                    style={s.timeInput}
                    value={settings.schedule.to}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        schedule: { ...p.schedule, to: e.target.value },
                      }))
                    }
                  />
                </div>

                <div style={s.scheduleRow}>
                  <span style={s.label}>Días activos</span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {ALL_DAYS.map((d) => (
                      <button
                        key={d}
                        style={s.dayBtn(settings.schedule.days.includes(d))}
                        onClick={() => toggleDay(d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Recordatorios automáticos ── */}
          <div style={s.card}>
            <p style={s.cardTitle}>Recordatorios automáticos a clientes</p>
            <p style={s.cardSub}>El sistema enviará recordatorios automáticos antes de cada reserva</p>

            <div style={{ display: "grid", gap: 16 }}>
              <div style={s.scheduleRow}>
                <span style={s.label}>Recordatorio previo</span>
                <Toggle
                  value={settings.reminders.clientReminder}
                  onChange={(v) =>
                    setSettings((p) => ({
                      ...p,
                      reminders: { ...p.reminders, clientReminder: v },
                    }))
                  }
                />
                {settings.reminders.clientReminder && (
                  <>
                    <select
                      style={s.select}
                      value={settings.reminders.reminderTime}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          reminders: { ...p.reminders, reminderTime: e.target.value },
                        }))
                      }
                    >
                      <option value="1">1 hora antes</option>
                      <option value="2">2 horas antes</option>
                      <option value="24">24 horas antes</option>
                      <option value="48">48 horas antes</option>
                    </select>
                  </>
                )}
              </div>

              <div style={s.scheduleRow}>
                <span style={s.label}>Segundo recordatorio</span>
                <Toggle
                  value={settings.reminders.secondReminder}
                  onChange={(v) =>
                    setSettings((p) => ({
                      ...p,
                      reminders: { ...p.reminders, secondReminder: v },
                    }))
                  }
                />
                {settings.reminders.secondReminder && (
                  <select
                    style={s.select}
                    value={settings.reminders.secondReminderTime}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        reminders: { ...p.reminders, secondReminderTime: e.target.value },
                      }))
                    }
                  >
                    <option value="1">1 hora antes</option>
                    <option value="2">2 horas antes</option>
                    <option value="24">24 horas antes</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
          <button style={s.saveBtn} onClick={handleSave}>
            Guardar configuración
          </button>
          {saved && (
            <span style={s.savedBadge}>
              ✓ Cambios guardados
            </span>
          )}
        </div>
      </div>
    </>
  );
}
