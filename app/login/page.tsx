"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTokenPayload } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Email o contraseña incorrectos.");
        return;
      }

      if (!data.access_token) {
        setError("No se recibió token del servidor.");
        return;
      }

      localStorage.setItem("token", data.access_token);
      const payload = getTokenPayload();
      if (payload?.role == "admin") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }
      router.refresh();

    } catch {
      setError("Error de conexión con el servidor.");
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
          <span className="auth-tab auth-tab--active">Iniciar sesión</span>
          <Link href="/register" className="auth-tab">Registro</Link>
        </div>

        <h2 className="auth-heading">Bienvenido de nuevo</h2>
        <p className="auth-subheading">Accede a tu panel de administración</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input className="input" type="email" placeholder="tu@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="auth-field">
            <label className="auth-label">Contraseña</label>
            <input className="input" type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <p className="message-error">{error}</p>}

          <button className="primary-btn auth-submit-btn" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="auth-link">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}