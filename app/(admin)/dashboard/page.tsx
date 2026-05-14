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
  { time: "09:00", client: "María López", business: "Peluquería Nova", service: "Corte + peinado", status: "confirmed" },
  { time: "10:30", client: "Carlos Pérez", business: "Restaurante Marea", service: "Reserva para 4", status: "pending" },
  { time: "12:00", client: "Lucía Sánchez", business: "Barber Studio", service: "Corte caballero", status: "paid" },
];

function Badge({ status, t }: { status: DashboardBookingStatus; t: (k: string) => string }) {
  const label = status === "pending" ? t("statusPending") : status === "confirmed" ? t("statusConfirmed") : t("statusPaid");
  return <span className={`badge badge--${status}`}>{label}</span>;
}

export default function DashboardPage() {
  const { t } = useI18n();

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("dashboardTitle")}</h2>
          <p>{t("dashboardSubtitle")}</p>
        </div>
        <button className="primary-btn" type="button">{t("exportReport")}</button>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiBookingsToday")}</p>
          <h3 className="kpi-card__value">24</h3>
          <p className="kpi-card__meta kpi-card__meta--positive">{t("kpiBookingsTodayMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiRevenue")}</p>
          <h3 className="kpi-card__value">820 €</h3>
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

      <section className="dashboard-grid">
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
                  <td style={{ fontWeight: 600 }}>{booking.time}</td>
                  <td>{booking.client}</td>
                  <td>{booking.business}</td>
                  <td>{booking.service}</td>
                  <td><Badge status={booking.status} t={t} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-stack">
          <div className="info-box">
            <p className="info-box__eyebrow">{t("nextBooking")}</p>
            <p className="info-box__title">María López</p>
            <p className="info-box__text">09:00 · Peluquería Nova</p>
          </div>
          <div className="info-box">
            <p className="info-box__eyebrow">{t("featuredBusiness")}</p>
            <p className="info-box__title">{t("featuredBusinessValue")}</p>
            <p className="info-box__text">{t("featuredBusinessMeta")}</p>
          </div>
          <div className="info-box">
            <p className="info-box__eyebrow">{t("reminders")}</p>
            <p className="info-box__title">{t("reminderTitle")}</p>
            <p className="info-box__text">{t("reminderText")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}