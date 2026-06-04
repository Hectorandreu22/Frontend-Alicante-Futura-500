"use client";

import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [phone, setPhone]   = useState("");
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        setName(payload.name ?? "");
        setEmail(payload.email ?? "");
      } catch {}
    }
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // TODO: PUT /api/profile
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="page-stack">
      <div className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Perfil</h3>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
          Gestiona tu información personal y de acceso
        </p>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Tu nombre"
              style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, color: "var(--text)", background: "var(--surface)", outline: "none", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, color: "var(--text)", background: "var(--surface)", outline: "none", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+34 600 000 000"
              style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, color: "var(--text)", background: "var(--surface)", outline: "none", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <button
              type="submit"
              style={{ padding: "9px 24px", borderRadius: 8, background: "var(--brand)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              Guardar cambios
            </button>
            {saved && (
              <span style={{ fontSize: 13, color: "var(--brand)", fontWeight: 600 }}>✓ Cambios guardados</span>
            )}
          </div>
        </form>
      </div>

      <div className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Cambiar contraseña</h3>
        </div>
        <form style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
          {["Contraseña actual", "Nueva contraseña", "Confirmar nueva contraseña"].map((label) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</label>
              <input
                type="password"
                placeholder="••••••••"
                style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, color: "var(--text)", background: "var(--surface)", outline: "none", fontFamily: "inherit" }}
              />
            </div>
          ))}
          <div>
            <button
              type="submit"
              style={{ padding: "9px 24px", borderRadius: 8, background: "var(--brand)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              Actualizar contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
