"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function validatePhone(phone: string): string {
  if (!phone) return "";
  if (/[a-zA-Z]/.test(phone)) return "Teléfono inválido (no se permiten letras)";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9) return "Teléfono inválido (mínimo 9 dígitos)";
  if (digits.length > 15) return "Teléfono inválido (demasiados dígitos)";
  return "";
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePhoneChange(value: string) {
    setPhone(value);
    setPhoneError(validatePhone(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const phoneValidation = validatePhone(phone);
    if (phoneValidation) {
      setPhoneError(phoneValidation);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, ...(phone && { phone }) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || "Error al crear la cuenta. Inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("No se pudo conectar con el servidor.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <h1 className="auth-brand__title">BookFlow</h1>
          <p className="auth-brand__subtitle">Admin workspace</p>
        </div>

        <hr className="auth-divider" />

        <div className="auth-tabs">
          <Link href="/login" className="auth-tab">Iniciar sesión</Link>
          <span className="auth-tab auth-tab--active">Registro</span>
        </div>

        <h2 className="auth-heading">Crear cuenta</h2>
        <p className="auth-subheading">Empieza a gestionar tus reservas hoy</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="name">Nombre</label>
            <input id="name" className="input" type="text" placeholder="Tu nombre"
              value={name} onChange={(e) => setName(e.target.value)}
              required autoComplete="name" />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input id="email" className="input" type="email" placeholder="tu@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email" />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="phone">
              Teléfono <span style={{ color: "var(--muted)", fontWeight: 400 }}>(opcional)</span>
            </label>
            <input id="phone" className="input" type="tel" placeholder="+34 600 000 000"
              value={phone} onChange={(e) => handlePhoneChange(e.target.value)}
              autoComplete="tel" />
            {phoneError && <p className="message-error" style={{ margin: 0 }}>{phoneError}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Contraseña</label>
            <input id="password" className="input" type="password" placeholder="Mínimo 8 caracteres"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={8} autoComplete="new-password" />
          </div>

          {error && <p className="message-error">{error}</p>}

          <button className="primary-btn auth-submit-btn" type="submit" disabled={loading || !!phoneError}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="auth-link">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
