"use client";

import { useState } from "react";

export default function WorkspacePage() {
  const [workspaceName, setWorkspaceName] = useState("BookFlow Workspace");
  const [timezone, setTimezone]           = useState("Europe/Madrid");
  const [currency, setCurrency]           = useState("EUR");
  const [saved, setSaved]                 = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // TODO: PUT /api/workspace
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const inputStyle = {
    padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--border)",
    fontSize: 13, color: "var(--text)", background: "var(--surface)",
    outline: "none", fontFamily: "inherit", width: "100%",
  };

  return (
    <div className="page-stack">
      <div className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Workspace</h3>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
          Configura los ajustes generales de tu espacio de trabajo
        </p>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Nombre del workspace</label>
            <input type="text" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Zona horaria</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)} style={inputStyle}>
              <option value="Europe/Madrid">Europe/Madrid (UTC+1)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
              <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Moneda</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} style={inputStyle}>
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dólar ($)</option>
              <option value="GBP">Libra (£)</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <button type="submit" style={{ padding: "9px 24px", borderRadius: 8, background: "var(--brand)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Guardar cambios
            </button>
            {saved && <span style={{ fontSize: 13, color: "var(--brand)", fontWeight: 600 }}>✓ Cambios guardados</span>}
          </div>
        </form>
      </div>

      <div className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Zona de peligro</h3>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
          Estas acciones son irreversibles. Procede con cuidado.
        </p>
        <button
          type="button"
          className="danger-btn"
          onClick={() => {
            if (confirm("¿Seguro que quieres eliminar el workspace? Esta acción no se puede deshacer.")) {
              alert("Workspace eliminado");
            }
          }}
        >
          Eliminar workspace
        </button>
      </div>
    </div>
  );
}
