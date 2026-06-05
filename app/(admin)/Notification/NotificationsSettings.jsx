"use client";

import { useState } from "react";

const INITIAL_SETTINGS = {
  channels: { email: true, sms: false, push: true },
  types: [
    { id: "new_booking",  label: "Nueva reserva",        description: "Cuando un cliente hace una nueva reserva",      icon: "📅", email: true,  sms: true,  push: true  },
    { id: "cancellation", label: "Cancelación",           description: "Cuando se cancela una reserva existente",       icon: "✕",  email: true,  sms: false, push: true  },
    { id: "payment",      label: "Pago recibido",         description: "Confirmación de cobros y pagos",                icon: "€",  email: true,  sms: false, push: false },
    { id: "reminder",     label: "Recordatorio de reserva", description: "Aviso antes de que empiece una reserva",     icon: "⏰", email: false, sms: true,  push: true  },
    { id: "pending",      label: "Reserva pendiente",     description: "Reservas que necesitan confirmación manual",    icon: "⚠️", email: true,  sms: true,  push: true  },
    { id: "review",       label: "Nueva valoración",      description: "Cuando un cliente deja una reseña",            icon: "⭐", email: true,  sms: false, push: false },
  ],
  schedule: { enabled: true, from: "08:00", to: "21:00", days: ["lun", "mar", "mié", "jue", "vie"] },
  reminders: { clientReminder: true, reminderTime: "24", secondReminder: false, secondReminderTime: "2" },
};

const ALL_DAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      aria-pressed={value}
      style={{
        width: 36, height: 20, borderRadius: 10,
        background: value ? "var(--brand)" : "var(--border)",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background .2s", display: "inline-block", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 3,
        left: value ? 19 : 3,
        width: 14, height: 14, borderRadius: "50%",
        background: "#fff", transition: "left .2s",
        boxShadow: "0 1px 3px rgba(0,0,0,.2)",
      }} />
    </button>
  );
}

export default function NotificationsSettings() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [saved, setSaved] = useState(false);

  const toggleChannel = (ch) =>
    setSettings((p) => ({ ...p, channels: { ...p.channels, [ch]: !p.channels[ch] } }));

  const toggleType = (id, field) =>
    setSettings((p) => ({ ...p, types: p.types.map((t) => t.id === id ? { ...t, [field]: !t[field] } : t) }));

  const toggleDay = (day) => {
    const days = settings.schedule.days.includes(day)
      ? settings.schedule.days.filter((d) => d !== day)
      : [...settings.schedule.days, day];
    setSettings((p) => ({ ...p, schedule: { ...p.schedule, days } }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputStyle = {
    padding: "8px 12px", borderRadius: 8,
    border: "1.5px solid var(--border)",
    fontSize: 13, color: "var(--text)",
    fontFamily: "inherit", outline: "none",
    background: "var(--surface)", width: 90,
  };

  const selectStyle = {
    padding: "8px 12px", borderRadius: 8,
    border: "1.5px solid var(--border)",
    fontSize: 13, color: "var(--text)",
    fontFamily: "inherit", outline: "none",
    background: "var(--surface)",
  };

  return (
    <div className="page-stack">

      {/* Header */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px", color: "var(--text)" }}>
          Notificaciones
        </h2>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
          Configura cómo y cuándo recibes alertas sobre reservas, pagos y clientes.
        </p>
      </div>

      {/* Canales */}
      <div className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Canales de envío</h3>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
          Elige por dónde quieres recibir las notificaciones
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[{ id: "email", label: "Email", icon: "✉️" }, { id: "sms", label: "SMS", icon: "💬" }, { id: "push", label: "Push", icon: "🔔" }].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => toggleChannel(id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 18px", borderRadius: 10,
                border: `1.5px solid ${settings.channels[id] ? "var(--brand)" : "var(--border)"}`,
                background: settings.channels[id] ? "var(--brand-soft)" : "var(--surface)",
                cursor: "pointer", transition: "all .15s", fontSize: 13, fontWeight: 600,
                color: settings.channels[id] ? "var(--brand)" : "var(--muted)",
                fontFamily: "inherit",
              }}
            >
              <span>{icon}</span> {label}
              {settings.channels[id] && <span style={{ marginLeft: 4, fontSize: 11 }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tipos de notificación */}
      <div className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Tipos de notificación</h3>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
          Activa o desactiva cada evento por canal
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Evento</th>
              {["EMAIL", "SMS", "PUSH"].map((ch) => (
                <th key={ch} style={{ textAlign: "center", width: 70 }}>{ch}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {settings.types.map((t) => (
              <tr key={t.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: "var(--surface-2, var(--brand-soft))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, flexShrink: 0,
                    }}>{t.icon}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 2px" }}>{t.label}</p>
                      <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>{t.description}</p>
                    </div>
                  </div>
                </td>
                {["email", "sms", "push"].map((ch) => (
                  <td key={ch} style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <Toggle value={t[ch] && settings.channels[ch]} onChange={() => toggleType(t.id, ch)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Horario */}
      <div className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Horario de notificaciones</h3>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
          Solo recibirás alertas en el rango horario seleccionado
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", minWidth: 140 }}>Activar horario</span>
          <Toggle value={settings.schedule.enabled} onChange={(v) => setSettings((p) => ({ ...p, schedule: { ...p.schedule, enabled: v } }))} />
        </div>

        {settings.schedule.enabled && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", minWidth: 140 }}>Desde</span>
              <input type="time" style={inputStyle} value={settings.schedule.from} onChange={(e) => setSettings((p) => ({ ...p, schedule: { ...p.schedule, from: e.target.value } }))} />
              <span style={{ fontSize: 13, color: "var(--muted)" }}>hasta</span>
              <input type="time" style={inputStyle} value={settings.schedule.to} onChange={(e) => setSettings((p) => ({ ...p, schedule: { ...p.schedule, to: e.target.value } }))} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", minWidth: 140 }}>Días activos</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ALL_DAYS.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    style={{
                      padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                      border: `1.5px solid ${settings.schedule.days.includes(d) ? "var(--brand)" : "var(--border)"}`,
                      background: settings.schedule.days.includes(d) ? "var(--brand-soft)" : "var(--surface)",
                      color: settings.schedule.days.includes(d) ? "var(--brand)" : "var(--muted)",
                      cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                    }}
                  >{d}</button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recordatorios */}
      <div className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Recordatorios automáticos a clientes</h3>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
          El sistema enviará recordatorios automáticos antes de cada reserva
        </p>

        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", minWidth: 140 }}>Recordatorio previo</span>
            <Toggle value={settings.reminders.clientReminder} onChange={(v) => setSettings((p) => ({ ...p, reminders: { ...p.reminders, clientReminder: v } }))} />
            {settings.reminders.clientReminder && (
              <select style={selectStyle} value={settings.reminders.reminderTime} onChange={(e) => setSettings((p) => ({ ...p, reminders: { ...p.reminders, reminderTime: e.target.value } }))}>
                <option value="1">1 hora antes</option>
                <option value="2">2 horas antes</option>
                <option value="24">24 horas antes</option>
                <option value="48">48 horas antes</option>
              </select>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", minWidth: 140 }}>Segundo recordatorio</span>
            <Toggle value={settings.reminders.secondReminder} onChange={(v) => setSettings((p) => ({ ...p, reminders: { ...p.reminders, secondReminder: v } }))} />
            {settings.reminders.secondReminder && (
              <select style={selectStyle} value={settings.reminders.secondReminderTime} onChange={(e) => setSettings((p) => ({ ...p, reminders: { ...p.reminders, secondReminderTime: e.target.value } }))}>
                <option value="1">1 hora antes</option>
                <option value="2">2 horas antes</option>
                <option value="24">24 horas antes</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Guardar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={handleSave}
          className="primary-btn"
          style={{ padding: "12px 32px", fontSize: 14 }}
        >
          Guardar configuración
        </button>
        {saved && (
          <span style={{ fontSize: 13, color: "var(--brand)", fontWeight: 600 }}>
            ✓ Cambios guardados
          </span>
        )}
      </div>
    </div>
  );
}