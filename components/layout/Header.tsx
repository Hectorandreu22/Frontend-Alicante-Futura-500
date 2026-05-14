"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <header className="admin-header">
      <div>
        <h1 className="admin-header__title">Bookings Admin</h1>
        <p className="admin-header__subtitle">Plataforma de gestión de reservas y cobros</p>
      </div>
      <div className="admin-header__actions">
        <button
          type="button"
          onClick={toggleDark}
          className="secondary-btn"
          title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          style={{ fontSize: 18, padding: "8px 14px" }}
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}