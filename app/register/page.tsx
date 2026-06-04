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
      const res = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          ...(phone ? { phone } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Error al crear la cuenta.");
        return;
      }

      // redirección limpia (sin NextAuth, sin lógica extra)
      router.push("/login?registered=true");

    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    } finally {
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
          <Link href="/login" className="auth-tab">
            Iniciar sesión
          </Link>
          <span className="auth-tab auth-tab--active">
            Registro
          </span>
        </div>

        <h2 className="auth-heading">Crear cuenta</h2>
        <p className="auth-subheading">
          Empieza a gestionar tus reservas hoy
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Nombre</label>
            <input
              className="input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">
              Teléfono{" "}
              <span style={{ fontWeight: 400, opacity: 0.7 }}>
                (opcional)
              </span>
            </label>

            <input
              className="input"
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
            />

            {phoneError && (
              <p className="message-error">{phoneError}</p>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label">Contraseña</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {error && (
            <p className="message-error">{error}</p>
          )}

          <button
            className="primary-btn auth-submit-btn"
            type="submit"
            disabled={loading || !!phoneError}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="auth-link">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}