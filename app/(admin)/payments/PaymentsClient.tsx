"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";

type PaymentStatus = "pending" | "paid";

type Payment = {
  id: string;
  client: string;
  business: string;
  amount: string;
  method: string;
  date: string;
  status: PaymentStatus;
};

const initialPayments: Payment[] = [
  { id: "COB-001", client: "María López", business: "Peluquería Nova", amount: "28", method: "Tarjeta", date: "15/04/2026", status: "paid" },
  { id: "COB-002", client: "Carlos Pérez", business: "Restaurante Marea", amount: "80", method: "Pendiente", date: "15/04/2026", status: "pending" },
  { id: "COB-003", client: "Lucía Sánchez", business: "Barber Studio", amount: "18", method: "Bizum", date: "15/04/2026", status: "paid" },
  { id: "COB-004", client: "Pedro Ruiz", business: "Peluquería Nova", amount: "45", method: "Efectivo", date: "16/04/2026", status: "paid" },
];

const emptyForm: Omit<Payment, "id"> = { client: "", business: "", amount: "", method: "", date: "", status: "pending" };

export default function PaymentsClient() {
  const { t } = useI18n();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<Omit<Payment, "id">>(emptyForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editForm, setEditForm] = useState<Omit<Payment, "id">>(emptyForm);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredPayments = useMemo(() =>
    payments.filter((p) =>
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.business.toLowerCase().includes(search.toLowerCase()) ||
      p.method.toLowerCase().includes(search.toLowerCase())
    ), [payments, search]
  );

  const totalCobrado = payments.filter((p) => p.status === "paid").reduce((acc, p) => acc + parseFloat(p.amount), 0);
  const totalPendiente = payments.filter((p) => p.status === "pending").reduce((acc, p) => acc + parseFloat(p.amount), 0);
  const metodoCounts = payments.reduce((acc, p) => {
    if (p.method && p.method !== "Pendiente") acc[p.method] = (acc[p.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const metodoMasUsado = Object.entries(metodoCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
  const conversion = payments.length > 0 ? Math.round((payments.filter((p) => p.status === "paid").length / payments.length) * 100) : 0;

  function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!createForm.client || !createForm.amount) { setErrorMessage(t("fillRequired")); return; }
    const newPayment: Payment = { ...createForm, id: `COB-${String(payments.length + 1).padStart(3, "0")}` };
    setPayments((prev) => [newPayment, ...prev]);
    setCreateForm(emptyForm); setIsCreateOpen(false);
    setSuccessMessage(t("paymentCreated")); setErrorMessage("");
  }

  function openEditForm(payment: Payment) {
    setEditingPayment(payment);
    setEditForm({ client: payment.client, business: payment.business, amount: payment.amount, method: payment.method, date: payment.date, status: payment.status });
    setIsCreateOpen(false); setErrorMessage(""); setSuccessMessage(""); setDeleteTargetId(null);
  }

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingPayment) return;
    setPayments((prev) => prev.map((p) => p.id === editingPayment.id ? { ...editForm, id: editingPayment.id } : p));
    setEditingPayment(null); setSuccessMessage(t("paymentUpdated"));
  }

  function confirmDelete() {
    if (!deleteTargetId) return;
    setPayments((prev) => prev.filter((p) => p.id !== deleteTargetId));
    setDeleteTargetId(null); setEditingPayment(null);
    setSuccessMessage(t("paymentDeleted"));
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("paymentsTitle")}</h2>
          <p>{t("paymentsSubtitle")}</p>
        </div>
        <button className="primary-btn" type="button" onClick={() => { setIsCreateOpen(true); setSuccessMessage(""); setErrorMessage(""); }}>
          {t("registerPayment")}
        </button>
      </section>

      {isCreateOpen && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">{t("newPaymentTitle")}</h3>
            <button type="button" className="secondary-btn" onClick={() => setIsCreateOpen(false)}>{t("cancelBtn")}</button>
          </div>
          <form onSubmit={handleCreateSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <input className="input" type="text" placeholder={t("colClient")} value={createForm.client}
                onChange={(e) => setCreateForm((p) => ({ ...p, client: e.target.value }))} required />
              <input className="input" type="text" placeholder={t("colBusiness")} value={createForm.business}
                onChange={(e) => setCreateForm((p) => ({ ...p, business: e.target.value }))} required />
              <input className="input" type="number" min={0} placeholder={t("colAmount")} value={createForm.amount}
                onChange={(e) => setCreateForm((p) => ({ ...p, amount: e.target.value }))} required />
              <select className="select" value={createForm.method} onChange={(e) => setCreateForm((p) => ({ ...p, method: e.target.value }))}>
                <option value="">{t("colMethod")}</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Bizum">Bizum</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Pendiente">Pendiente</option>
              </select>
              <input className="input" type="date" value={createForm.date}
                onChange={(e) => setCreateForm((p) => ({ ...p, date: e.target.value }))} required />
              <select className="select" value={createForm.status} onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value as PaymentStatus }))}>
                <option value="pending">{t("statusPay")}</option>
                <option value="paid">{t("statusPaid2")}</option>
              </select>
            </div>
            {errorMessage && <div className="message-error">{errorMessage}</div>}
            <div className="message-row">
              <button className="primary-btn" type="submit">{t("registerPaymentBtn")}</button>
            </div>
          </form>
        </section>
      )}

      {editingPayment && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">{t("editPaymentTitle")} {editingPayment.id}</h3>
            <button type="button" className="secondary-btn" onClick={() => setEditingPayment(null)}>{t("cancelBtn")}</button>
          </div>
          <form onSubmit={handleEditSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <input className="input" type="text" placeholder={t("colClient")} value={editForm.client}
                onChange={(e) => setEditForm((p) => ({ ...p, client: e.target.value }))} required />
              <input className="input" type="text" placeholder={t("colBusiness")} value={editForm.business}
                onChange={(e) => setEditForm((p) => ({ ...p, business: e.target.value }))} required />
              <input className="input" type="number" min={0} placeholder={t("colAmount")} value={editForm.amount}
                onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))} required />
              <select className="select" value={editForm.method} onChange={(e) => setEditForm((p) => ({ ...p, method: e.target.value }))}>
                <option value="">{t("colMethod")}</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Bizum">Bizum</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Pendiente">Pendiente</option>
              </select>
              <input className="input" type="date" value={editForm.date}
                onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))} required />
              <select className="select" value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as PaymentStatus }))}>
                <option value="pending">{t("statusPay")}</option>
                <option value="paid">{t("statusPaid2")}</option>
              </select>
            </div>
            {errorMessage && <div className="message-error">{errorMessage}</div>}
            <div className="message-row" style={{ display: "flex", gap: 12 }}>
              <button className="primary-btn" type="submit">{t("savePaymentBtn")}</button>
              <button type="button" className="danger-btn" onClick={() => setDeleteTargetId(editingPayment.id)}>{t("deletePaymentBtn")}</button>
            </div>
          </form>
        </section>
      )}

      {deleteTargetId !== null && (
        <div className="modal-backdrop" role="dialog" aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTargetId(null); }}>
          <div className="modal-card">
            <div className="modal-icon">!</div>
            <h3 className="modal-title">{t("deletePaymentTitle")}</h3>
            <p className="modal-text">{t("deletePaymentText")} {deleteTargetId}</p>
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setDeleteTargetId(null)}>{t("cancelBtn")}</button>
              <button type="button" className="danger-btn" onClick={confirmDelete}>{t("deleteBtn")}</button>
            </div>
          </div>
        </div>
      )}

      <section className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiRevenueToday")}</p>
          <h3 className="kpi-card__value">{totalCobrado} €</h3>
          <p className="kpi-card__meta kpi-card__meta--positive">{payments.filter(p => p.status === "paid").length} {t("kpiRevenueMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiPendingPayment")}</p>
          <h3 className="kpi-card__value">{totalPendiente} €</h3>
          <p className="kpi-card__meta kpi-card__meta--warning">{payments.filter(p => p.status === "pending").length} {t("kpiPendingMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiTopMethod")}</p>
          <h3 className="kpi-card__value">{metodoMasUsado}</h3>
          <p className="kpi-card__meta">{t("kpiTopMethodMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiConversion")}</p>
          <h3 className="kpi-card__value">{conversion}%</h3>
          <p className="kpi-card__meta">{t("kpiConversionMeta")}</p>
        </div>
      </section>

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">{t("paymentListTitle")}</h3>
          <span style={{ color: "#6b7280", fontSize: 14 }}>{filteredPayments.length} {t("totalBookingsMeta")}</span>
        </div>
        <div className="search-row" style={{ marginBottom: 16 }}>
          <input className="input" placeholder={t("searchPayment")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {successMessage && <div className="message-success" style={{ marginBottom: 12 }}>{successMessage}</div>}
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("colId")}</th>
              <th>{t("colClient")}</th>
              <th>{t("colBusiness")}</th>
              <th>{t("colAmount")}</th>
              <th>{t("colMethod")}</th>
              <th>{t("colDate2")}</th>
              <th>{t("colStatus")}</th>
              <th>{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 24 }}>{t("noPayments")}</td></tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td style={{ fontWeight: 600 }}>{payment.id}</td>
                  <td>{payment.client}</td>
                  <td>{payment.business}</td>
                  <td>{payment.amount} €</td>
                  <td>{payment.method}</td>
                  <td>{payment.date}</td>
                  <td>
                    <span className={`badge badge--${payment.status === "pending" ? "pending" : "confirmed"}`}>
                      {payment.status === "pending" ? t("statusPay") : t("statusPaid2")}
                    </span>
                  </td>
                  <td>
                    <button type="button" onClick={() => openEditForm(payment)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, opacity: 0.5 }}
                      title={t("editBtn")}>
                      ✏️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}