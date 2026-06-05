"use client";

import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type DashboardBookingStatus = "pending" | "confirmed" | "paid";

type Appointment = {
  id: number;
  date: string;
  time: string;
  status: string;
  serviceName?: string;
  customer?: { name: string };
  businessId: number;
};

type Payment = {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
};

type Customer = {
  id: number;
  createdAt?: string;
};

type DashboardBooking = {
  time: string;
  client: string;
  business: string;
  service: string;
  status: DashboardBookingStatus;
};

function Badge({ status, t }: { status: DashboardBookingStatus; t: (k: string) => string }) {
  const label =
    status === "pending" ? t("statusPending") :
      status === "confirmed" ? t("statusConfirmed") :
        t("statusPaid");
  return <span className={`badge badge--${status}`}>{label}</span>;
}

function MiniLineChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const w = 240, h = 80, pad = 12;
  const xStep = (w - pad * 2) / Math.max(data.length - 1, 1);
  const points = data.map((v, i) => {
    const x = pad + i * xStep;
    const y = pad + (1 - v / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = [
    `${pad},${h - pad}`,
    ...data.map((v, i) => {
      const x = pad + i * xStep;
      const y = pad + (1 - v / max) * (h - pad * 2);
      return `${x},${y}`;
    }),
    `${pad + (data.length - 1) * xStep},${h - pad}`,
  ].join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 80, overflow: "visible" }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#lineGrad)" />
      <polyline points={points} fill="none" stroke="var(--brand)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => {
        const x = pad + i * xStep;
        const y = pad + (1 - v / max) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--brand)" stroke="var(--surface)" strokeWidth="2" />;
      })}
    </svg>
  );
}

function MiniBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
          <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
            <div style={{
              width: "100%",
              height: `${(v / max) * 100}%`,
              background: i === data.length - 1 ? "var(--brand)" : "var(--brand-light)",
              borderRadius: "4px 4px 0 0",
              minHeight: 6,
              transition: "height 0.4s ease",
              border: "1px solid",
              borderColor: i === data.length - 1 ? "var(--brand)" : "var(--border)",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useI18n();

  const [upcomingBookings, setUpcomingBookings] = useState<DashboardBooking[]>([]);
  const [nextBooking, setNextBooking] = useState<DashboardBooking | null>(null);
  const [kpiBookingsToday, setKpiBookingsToday] = useState(0);
  const [kpiRevenue, setKpiRevenue] = useState(0);
  const [kpiPending, setKpiPending] = useState(0);
  const [kpiActiveClients, setKpiActiveClients] = useState(0);
  const [revenueData, setRevenueData] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [monthKeys, setMonthKeys] = useState<string[]>(["", "", "", "", "", ""]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    // Citas
    fetch(`${API_URL}/appointments`)
      .then((r) => r.json())
      .then((appointments: Appointment[]) => {
        // KPI reservas hoy
        const todayAppts = appointments.filter((a) => a.date === today);
        setKpiBookingsToday(todayAppts.length);

        // Pendientes
        const pending = appointments.filter((a) => a.status === "pending");
        setKpiPending(pending.length);

        // Próximas reservas (futuras o hoy, confirmadas/pendientes, primeras 5)
        const upcoming = appointments
          .filter((a) => a.date >= today && (a.status === "pending" || a.status === "confirmed"))
          .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
          .slice(0, 5)
          .map((a) => ({
            time: a.time,
            client: a.customer?.name ?? `Cliente ${a.id}`,
            business: `Negocio ${a.businessId}`,
            service: a.serviceName ?? "Servicio",
            status: (a.status === "confirmed" ? "confirmed" : "pending") as DashboardBookingStatus,
          }));
        setUpcomingBookings(upcoming);
        if (upcoming.length > 0) setNextBooking(upcoming[0]);
      })
      .catch(console.error);

    // Pagos
    fetch(`${API_URL}/payments`)
      .then((r) => r.json())
      .then((payments: Payment[]) => {
        // KPI cobrado hoy
        const todayPaid = payments
          .filter((p) => (p.status === "completed" || p.status === "paid") && p.createdAt?.startsWith(today))
          .reduce((acc, p) => acc + Number(p.amount), 0);
        setKpiRevenue(todayPaid);

        // Ingresos últimos 6 meses
        const now = new Date();
        const months: number[] = [];
        const labels: string[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push(d.toLocaleString("es-ES", { month: "short" }));
          const total = payments
            .filter((p) => {
              if (!p.createdAt) return false;
              const pd = new Date(p.createdAt);
              return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth() && (p.status === "completed" || p.status === "paid");
            })
            .reduce((acc, p) => acc + Number(p.amount), 0);
          months.push(total);
        }
        setRevenueData(months);
        setMonthKeys(labels);
      })
      .catch(console.error);

    // Clientes activos
    fetch(`${API_URL}/customers`)
      .then((r) => r.json())
      .then((customers: Customer[]) => setKpiActiveClients(customers.length))
      .catch(console.error);
  }, []);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("dashboardTitle")}</h2>
          <p>{t("dashboardSubtitle")}</p>
        </div>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiBookingsToday")}</p>
          <h3 className="kpi-card__value">{kpiBookingsToday}</h3>
          <p className="kpi-card__meta kpi-card__meta--positive">{t("kpiBookingsTodayMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiRevenue")}</p>
          <h3 className="kpi-card__value">{kpiRevenue.toFixed(0)}€</h3>
          <p className="kpi-card__meta">{t("kpiRevenueMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiPending")}</p>
          <h3 className="kpi-card__value">{kpiPending}</h3>
          <p className="kpi-card__meta kpi-card__meta--warning">{t("kpiPendingMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiActiveClients")}</p>
          <h3 className="kpi-card__value">{kpiActiveClients}</h3>
          <p className="kpi-card__meta">{t("kpiActiveClientsMeta")}</p>
        </div>
      </section>

      <section className="dashboard-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="section-card">
            <div className="panel-title-row">
              <h3 className="panel-title">{t("upcomingBookings")}</h3>
              <button className="panel-subtle-link" type="button">{t("viewAll")}</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("colTime")}</th>
                  <th>{t("colClient")}</th>
                  <th>{t("colBusiness")}</th>
                  <th>{t("colService")}</th>
                  <th>{t("colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--muted)" }}>No hay próximas reservas</td></tr>
                ) : (
                  upcomingBookings.map((booking, index) => (
                    <tr key={index}>
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace", fontSize: 13, color: "var(--brand)", background: "var(--brand-soft)", padding: "3px 8px", borderRadius: 6 }}>
                          {booking.time}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--text)" }}>{booking.client}</td>
                      <td style={{ color: "var(--muted)" }}>{booking.business}</td>
                      <td style={{ color: "var(--text-2)" }}>{booking.service}</td>
                      <td><Badge status={booking.status} t={t} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="section-card">
            <div className="panel-title-row">
              <h3 className="panel-title">{t("monthlyRevenue")}</h3>
              <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{t("lastSixMonths")}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <p style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                  {t("accumulatedTrend")}
                </p>
                <MiniLineChart data={revenueData} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  {monthKeys.map((m, i) => <span key={i} style={{ fontSize: 10.5, color: "var(--muted-2)", fontWeight: 600 }}>{m}</span>)}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                  {t("byService")}
                </p>
                <MiniBarChart data={revenueData} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  {monthKeys.map((m, i) => <span key={i} style={{ fontSize: 10.5, color: "var(--muted-2)", fontWeight: 600 }}>{m}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="info-stack">
          <div className="info-box">
            <p className="info-box__eyebrow">{t("nextBooking")}</p>
            {nextBooking ? (
              <>
                <p className="info-box__title">{nextBooking.client}</p>
                <p className="info-box__text">{nextBooking.time} · {nextBooking.business}</p>
                <div style={{ marginTop: 12 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--brand)", background: "var(--brand-soft)", padding: "3px 10px", borderRadius: 999 }}>
                    {nextBooking.service}
                  </span>
                </div>
              </>
            ) : (
              <p className="info-box__text">No hay reservas próximas</p>
            )}
          </div>

          <div className="info-box">
            <p className="info-box__eyebrow">{t("featuredBusiness")}</p>
            <p className="info-box__title">{t("featuredBusinessValue")}</p>
            <p className="info-box__text">{t("featuredBusinessMeta")}</p>
            <div style={{ marginTop: 12, display: "flex", gap: 4 }}>
              {["—", "—", "—"].map((_, i) => (
                <div key={i} style={{ height: 3, flex: 1, borderRadius: 99, background: i < 2 ? "var(--brand)" : "var(--border)" }} />
              ))}
            </div>
          </div>

          <div className="info-box">
            <p className="info-box__eyebrow" style={{ color: "var(--brand)", marginBottom: 10 }}>{t("reminders")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="reminder-item">
                <span className="reminder-icon">✓</span>
                <span>{t("reminderTitle")}</span>
              </div>
              <div className="reminder-item">
                <span className="reminder-icon">✓</span>
                <span>{t("reminderText")}</span>
              </div>
              <div className="reminder-item" style={{ opacity: 0.45 }}>
                <span className="reminder-icon" style={{ background: "var(--border)", color: "var(--muted)" }}>○</span>
                <span>Revisar pagos pendientes</span>
              </div>
            </div>
          </div>

          <div className="info-box">
            <p className="info-box__eyebrow">{t("recentActivity")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              {[
                { label: "Nueva reserva creada", time: "Hace 5 min", dot: "var(--brand)" },
                { label: "Pago recibido · 120€", time: "Hace 18 min", dot: "#3b82f6" },
                { label: "Cliente nuevo registrado", time: "Hace 1 h", dot: "#8b5cf6" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.dot, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{item.label}</p>
                    <p style={{ fontSize: 11.5, color: "var(--muted-2)", marginTop: 1 }}>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}