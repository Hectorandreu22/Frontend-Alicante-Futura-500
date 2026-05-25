"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos.");
    } else {
      router.push("/dashboard");
      router.refresh();
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
            <label className="auth-label" htmlFor="email">Email</label>
            <input id="email" className="input" type="email" placeholder="tu@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email" />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Contraseña</label>
            <input id="password" className="input" type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required autoComplete="current-password" />
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
