"use client";

import { useI18n } from "@/lib/i18n";

type DashboardBookingStatus = "pending" | "confirmed" | "paid";

type DashboardBooking = {
  time: string;
  client: string;
  business: string;
  service: string;
  status: DashboardBookingStatus;
};

const bookings: DashboardBooking[] = [
  { time: "09:00", client: "María López",    business: "Peluquería Nova",   service: "Corte + peinado",  status: "confirmed" },
  { time: "10:30", client: "Carlos Pérez",   business: "Restaurante Marea", service: "Reserva para 4",   status: "pending"   },
  { time: "12:00", client: "Lucía Sánchez",  business: "Barber Studio",     service: "Corte caballero",  status: "paid"      },
];

const revenueData = [420, 560, 480, 710, 650, 820];
const monthKeys   = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];

function Badge({ status, t }: { status: DashboardBookingStatus; t: (k: string) => string }) {
  const label =
    status === "pending"   ? t("statusPending")   :
    status === "confirmed" ? t("statusConfirmed") :
                             t("statusPaid");
  return <span className={`badge badge--${status}`}>{label}</span>;
}

function MiniLineChart() {
  const max = Math.max(...revenueData);
  const w = 240, h = 80, pad = 12;
  const xStep = (w - pad * 2) / (revenueData.length - 1);
  const points = revenueData.map((v, i) => {
    const x = pad + i * xStep;
    const y = pad + (1 - v / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = [
    `${pad},${h - pad}`,
    ...revenueData.map((v, i) => {
      const x = pad + i * xStep;
      const y = pad + (1 - v / max) * (h - pad * 2);
      return `${x},${y}`;
    }),
    `${pad + (revenueData.length - 1) * xStep},${h - pad}`,
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
      {revenueData.map((v, i) => {
        const x = pad + i * xStep;
        const y = pad + (1 - v / max) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--brand)" stroke="var(--surface)" strokeWidth="2" />;
      })}
    </svg>
  );
}

function MiniBarChart() {
  const max = Math.max(...revenueData);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
      {revenueData.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
          <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
            <div style={{
              width: "100%",
              height: `${(v / max) * 100}%`,
              background: i === revenueData.length - 1 ? "var(--brand)" : "var(--brand-light)",
              borderRadius: "4px 4px 0 0",
              minHeight: 6,
              transition: "height 0.4s ease",
              border: "1px solid",
              borderColor: i === revenueData.length - 1 ? "var(--brand)" : "var(--border)",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useI18n();

  return (
    <div className="page-stack">

      {/* ── Hero ── */}
      <section className="page-hero">
        <div>
          <h2>{t("dashboardTitle")}</h2>
          <p>{t("dashboardSubtitle")}</p>
        </div>
      </section>

      {/* ── KPI Cards ── */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiBookingsToday")}</p>
          <h3 className="kpi-card__value">24</h3>
          <p className="kpi-card__meta kpi-card__meta--positive">{t("kpiBookingsTodayMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiRevenue")}</p>
          <h3 className="kpi-card__value">820€</h3>
          <p className="kpi-card__meta">{t("kpiRevenueMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiPending")}</p>
          <h3 className="kpi-card__value">6</h3>
          <p className="kpi-card__meta kpi-card__meta--warning">{t("kpiPendingMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiActiveClients")}</p>
          <h3 className="kpi-card__value">214</h3>
          <p className="kpi-card__meta">{t("kpiActiveClientsMeta")}</p>
        </div>
      </section>

      {/* ── Dashboard overview ── */}
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
                {bookings.map((booking, index) => (
                  <tr key={index}>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 13,
                        color: "var(--brand)",
                        background: "var(--brand-soft)",
                        padding: "3px 8px",
                        borderRadius: 6,
                      }}>
                        {booking.time}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>{booking.client}</td>
                    <td style={{ color: "var(--muted)" }}>{booking.business}</td>
                    <td style={{ color: "var(--text-2)" }}>{booking.service}</td>
                    <td><Badge status={booking.status} t={t} /></td>
                  </tr>
                ))}
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
                <MiniLineChart />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  {monthKeys.map((m) => (
                    <span key={m} style={{ fontSize: 10.5, color: "var(--muted-2)", fontWeight: 600 }}>{m}</span>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                  {t("byService")}
                </p>
                <MiniBarChart />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  {monthKeys.map((m) => (
                    <span key={m} style={{ fontSize: 10.5, color: "var(--muted-2)", fontWeight: 600 }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="info-stack">
          <div className="info-box">
            <p className="info-box__eyebrow">{t("nextBooking")}</p>
            <p className="info-box__title">María López</p>
            <p className="info-box__text">09:00 · Peluquería Nova</p>
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--brand)", background: "var(--brand-soft)", padding: "3px 10px", borderRadius: 999 }}>
                En 30 min
              </span>
            </div>
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
                { label: "Nueva reserva creada",     time: "Hace 5 min",  dot: "var(--brand)" },
                { label: "Pago recibido · 120€",     time: "Hace 18 min", dot: "#3b82f6"      },
                { label: "Cliente nuevo registrado", time: "Hace 1 h",    dot: "#8b5cf6"      },
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
