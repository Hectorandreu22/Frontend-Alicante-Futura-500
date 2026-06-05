"use client";

import { useState, useMemo, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

type PaymentStatus = "pending" | "paid" | "completed" | "refunded";

type Payment = {
  id: number;
  customerId: number;
  appointmentId: number;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  customer?: { name: string };
  appointment?: { businessId: number; business?: { name: string } };
};

type PaymentView = {
  id: string;
  rawId: number;
  client: string;
  business: string;
  amount: string;
  method: string;
  date: string;
  status: "pending" | "paid";
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const emptyForm = { client: "", business: "", amount: "", method: "", date: "", status: "pending" as "pending" | "paid" };

function toView(p: Payment): PaymentView {
  return {
    id: `COB-${String(p.id).padStart(3, "0")}`,
    rawId: p.id,
    client: p.customer?.name ?? `Cliente ${p.customerId}`,
    business: p.appointment?.business?.name ?? `Negocio`,
    amount: String(p.amount),
    method: "Tarjeta",
    date: new Date(p.createdAt).toLocaleDateString("es-ES"),
    status: p.status === "completed" || p.status === "paid" ? "paid" : "pending",
  };
}

export default function PaymentsClient() {
  const { t } = useI18n();
  const [payments, setPayments] = useState<PaymentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingPayment, setEditingPayment] = useState<PaymentView | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/payments`, {
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => r.json())
      .then((data: Payment[]) => setPayments(data.map(toView)))
      .catch(() => setErrorMessage("Error al cargar los pagos"))
      .finally(() => setLoading(false));
  }, []);

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

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!createForm.client || !createForm.amount) { setErrorMessage(t("fillRequired")); return; }
    try {
      const res = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(createForm.amount),
          status: createForm.status === "paid" ? "completed" : "pending",
          customerId: 1,
          appointmentId: 1,
        }),
      });
      const created: Payment = await res.json();
      const newView: PaymentView = { ...toView(created), client: createForm.client, business: createForm.business, method: createForm.method, date: createForm.date };
      setPayments((prev) => [newView, ...prev]);
      setCreateForm(emptyForm);
      setIsCreateOpen(false);
      setSuccessMessage(t("paymentCreated"));
      setErrorMessage("");
    } catch {
      setErrorMessage("Error al crear el pago");
    }
  }

  function openEditForm(payment: PaymentView) {
    setEditingPayment(payment);
    setEditForm({ client: payment.client, business: payment.business, amount: payment.amount, method: payment.method, date: payment.date, status: payment.status });
    setIsCreateOpen(false); setErrorMessage(""); setSuccessMessage(""); setDeleteTargetId(null);
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingPayment) return;
    try {
      await fetch(`${API_URL}/payments/${editingPayment.rawId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(editForm.amount),
          status: editForm.status === "paid" ? "completed" : "pending",
        }),
      });
      setPayments((prev) => prev.map((p) => p.rawId === editingPayment.rawId ? { ...p, ...editForm } : p));
      setEditingPayment(null);
      setSuccessMessage(t("paymentUpdated"));
    } catch {
      setErrorMessage("Error al editar el pago");
    }
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    const target = payments.find((p) => p.id === deleteTargetId);
    if (!target) return;
    try {
      await fetch(`${API_URL}/payments/${target.rawId}`, { method: "DELETE" });
      setPayments((prev) => prev.filter((p) => p.id !== deleteTargetId));
      setDeleteTargetId(null);
      setEditingPayment(null);
      setSuccessMessage(t("paymentDeleted"));
    } catch {
      setErrorMessage("Error al eliminar el pago");
    }
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
              <input className="input" type="text" placeholder={t("colClient")} value={createForm.client} onChange={(e) => setCreateForm((p) => ({ ...p, client: e.target.value }))} required />
              <input className="input" type="text" placeholder={t("colBusiness")} value={createForm.business} onChange={(e) => setCreateForm((p) => ({ ...p, business: e.target.value }))} required />
              <input className="input" type="number" min={0} placeholder={t("colAmount")} value={createForm.amount} onChange={(e) => setCreateForm((p) => ({ ...p, amount: e.target.value }))} required />
              <select className="select" value={createForm.method} onChange={(e) => setCreateForm((p) => ({ ...p, method: e.target.value }))}>
                <option value="">{t("colMethod")}</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Bizum">Bizum</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Pendiente">Pendiente</option>
              </select>
              <input className="input" type="date" value={createForm.date} onChange={(e) => setCreateForm((p) => ({ ...p, date: e.target.value }))} required />
              <select className="select" value={createForm.status} onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value as "pending" | "paid" }))}>
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
              <input className="input" type="text" placeholder={t("colClient")} value={editForm.client} onChange={(e) => setEditForm((p) => ({ ...p, client: e.target.value }))} required />
              <input className="input" type="text" placeholder={t("colBusiness")} value={editForm.business} onChange={(e) => setEditForm((p) => ({ ...p, business: e.target.value }))} required />
              <input className="input" type="number" min={0} placeholder={t("colAmount")} value={editForm.amount} onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))} required />
              <select className="select" value={editForm.method} onChange={(e) => setEditForm((p) => ({ ...p, method: e.target.value }))}>
                <option value="">{t("colMethod")}</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Bizum">Bizum</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Pendiente">Pendiente</option>
              </select>
              <input className="input" type="date" value={editForm.date} onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))} required />
              <select className="select" value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as "pending" | "paid" }))}>
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
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTargetId(null); }}>
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
          <h3 className="kpi-card__value">{totalCobrado.toFixed(2)} €</h3>
          <p className="kpi-card__meta kpi-card__meta--positive">{payments.filter(p => p.status === "paid").length} {t("kpiRevenueMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("kpiPendingPayment")}</p>
          <h3 className="kpi-card__value">{totalPendiente.toFixed(2)} €</h3>
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
        {loading ? (
          <p style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>Cargando pagos...</p>
        ) : (
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
                  <tr key={payment.rawId}>
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
        )}
      </section>
    </div>
  );
}