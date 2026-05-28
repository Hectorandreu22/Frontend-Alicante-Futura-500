"use client";

import { useState, useMemo, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

type PaymentStatus = "pending" | "completed";

type Payment = {
  id: number;
  customerId: number;
  appointmentId: number;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
};

const emptyForm = { customerId: "", appointmentId: "", amount: "", status: "pending" as PaymentStatus };

export default function PaymentsClient() {
  const { t } = useI18n();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/payments")
      .then((res) => res.json())
      .then((data) => setPayments(data))
      .catch(() => setErrorMessage("Error al cargar los pagos"));
  }, []);

  const filteredPayments = useMemo(() =>
    payments.filter((p) =>
      String(p.customerId).includes(search) ||
      String(p.appointmentId).includes(search) ||
      p.status.toLowerCase().includes(search.toLowerCase())
    ), [payments, search]
  );

  const totalCobrado = payments.filter((p) => p.status === "completed").reduce((acc, p) => acc + Number(p.amount), 0);
  const totalPendiente = payments.filter((p) => p.status === "pending").reduce((acc, p) => acc + Number(p.amount), 0);
  const conversion = payments.length > 0 ? Math.round((payments.filter((p) => p.status === "completed").length / payments.length) * 100) : 0;

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!createForm.customerId || !createForm.amount) { setErrorMessage(t("fillRequired")); return; }
    const res = await fetch("http://localhost:3000/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: Number(createForm.customerId),
        appointmentId: Number(createForm.appointmentId),
        amount: Number(createForm.amount),
        status: createForm.status,
      }),
    });
    const newPayment = await res.json();
    setPayments((prev) => [newPayment, ...prev]);
    setCreateForm(emptyForm); setIsCreateOpen(false);
    setSuccessMessage(t("paymentCreated")); setErrorMessage("");
  }

  function openEditForm(payment: Payment) {
    setEditingPayment(payment);
    setEditForm({ customerId: String(payment.customerId), appointmentId: String(payment.appointmentId), amount: String(payment.amount), status: payment.status });
    setIsCreateOpen(false); setErrorMessage(""); setSuccessMessage(""); setDeleteTargetId(null);
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingPayment) return;
    const res = await fetch(`http://localhost:3000/payments/${editingPayment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: Number(editForm.customerId),
        appointmentId: Number(editForm.appointmentId),
        amount: Number(editForm.amount),
        status: editForm.status,
      }),
    });
    const updated = await res.json();
    setPayments((prev) => prev.map((p) => p.id === editingPayment.id ? updated : p));
    setEditingPayment(null); setSuccessMessage(t("paymentUpdated"));
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    await fetch(`http://localhost:3000/payments/${deleteTargetId}`, { method: "DELETE" });
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
              <input className="input" type="number" placeholder="ID Cliente" value={createForm.customerId}
                onChange={(e) => setCreateForm((p) => ({ ...p, customerId: e.target.value }))} required />
              <input className="input" type="number" placeholder="ID Cita" value={createForm.appointmentId}
                onChange={(e) => setCreateForm((p) => ({ ...p, appointmentId: e.target.value }))} required />
              <input className="input" type="number" min={0} placeholder={t("colAmount")} value={createForm.amount}
                onChange={(e) => setCreateForm((p) => ({ ...p, amount: e.target.value }))} required />
              <select className="select" value={createForm.status} onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value as PaymentStatus }))}>
                <option value="pending">{t("statusPay")}</option>
                <option value="completed">{t("statusPaid2")}</option>
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
            <h3 className="panel-title">{t("editPaymentTitle")} #{editingPayment.id}</h3>
            <button type="button" className="secondary-btn" onClick={() => setEditingPayment(null)}>{t("cancelBtn")}</button>
          </div>
          <form onSubmit={handleEditSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <input className="input" type="number" placeholder="ID Cliente" value={editForm.customerId}
                onChange={(e) => setEditForm((p) => ({ ...p, customerId: e.target.value }))} required />
              <input className="input" type="number" placeholder="ID Cita" value={editForm.appointmentId}
                onChange={(e) => setEditForm((p) => ({ ...p, appointmentId: e.target.value }))} required />
              <input className="input" type="number" min={0} placeholder={t("colAmount")} value={editForm.amount}
                onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))} required />
              <select className="select" value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as PaymentStatus }))}>
                <option value="pending">{t("statusPay")}</option>
                <option value="completed">{t("statusPaid2")}</option>
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
            <p className="modal-text">{t("deletePaymentText")} #{deleteTargetId}</p>
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
          <p className="kpi-card__meta kpi-card__meta--positive">{payments.filter(p => p.status === "completed").length} {t("kpiRevenueMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiPendingPayment")}</p>
          <h3 className="kpi-card__value">{totalPendiente} €</h3>
          <p className="kpi-card__meta kpi-card__meta--warning">{payments.filter(p => p.status === "pending").length} {t("kpiPendingMeta")}</p>
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
              <th>ID</th>
              <th>ID Cliente</th>
              <th>ID Cita</th>
              <th>{t("colAmount")}</th>
              <th>{t("colStatus")}</th>
              <th>Fecha</th>
              <th>{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: 24 }}>{t("noPayments")}</td></tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td style={{ fontWeight: 600 }}>#{payment.id}</td>
                  <td>{payment.customerId}</td>
                  <td>{payment.appointmentId}</td>
                  <td>{Number(payment.amount)} €</td>
                  <td>
                    <span className={`badge badge--${payment.status === "pending" ? "pending" : "confirmed"}`}>
                      {payment.status === "pending" ? t("statusPay") : t("statusPaid2")}
                    </span>
                  </td>
                  <td>{new Date(payment.createdAt).toLocaleDateString("es-ES")}</td>
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