"use client";

import { useState, useMemo } from "react";

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

const emptyForm: Omit<Payment, "id"> = {
    client: "",
    business: "",
    amount: "",
    method: "",
    date: "",
    status: "pending",
};

function KpiCard({ title, value, subtitle, variant }: {
    title: string; value: string; subtitle: string; variant?: "positive" | "warning";
}) {
    return (
        <div className="kpi-card">
            <p className="kpi-card__label">{title}</p>
            <h3 className="kpi-card__value">{value}</h3>
            <p className={`kpi-card__meta ${variant === "positive" ? "kpi-card__meta--positive" : variant === "warning" ? "kpi-card__meta--warning" : ""}`}>
                {subtitle}
            </p>
        </div>
    );
}

function Badge({ status }: { status: PaymentStatus }) {
    return (
        <span className={`badge badge--${status === "pending" ? "pending" : "confirmed"}`}>
            {status === "pending" ? "Por cobrar" : "Pagado"}
        </span>
    );
}

export default function PaymentsClient() {
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

    const totalCobrado = payments
        .filter((p) => p.status === "paid")
        .reduce((acc, p) => acc + parseFloat(p.amount), 0);

    const totalPendiente = payments
        .filter((p) => p.status === "pending")
        .reduce((acc, p) => acc + parseFloat(p.amount), 0);

    const metodoCounts = payments.reduce((acc, p) => {
        if (p.method && p.method !== "Pendiente") {
            acc[p.method] = (acc[p.method] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
    const metodoMasUsado = Object.entries(metodoCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

    const conversion = payments.length > 0
        ? Math.round((payments.filter((p) => p.status === "paid").length / payments.length) * 100)
        : 0;

    function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!createForm.client || !createForm.amount) {
            setErrorMessage("Rellena todos los campos obligatorios.");
            return;
        }
        const newPayment: Payment = {
            ...createForm,
            id: `COB-${String(payments.length + 1).padStart(3, "0")}`,
        };
        setPayments((prev) => [newPayment, ...prev]);
        setCreateForm(emptyForm);
        setIsCreateOpen(false);
        setSuccessMessage("Cobro registrado correctamente.");
        setErrorMessage("");
    }

    function openEditForm(payment: Payment) {
        setEditingPayment(payment);
        setEditForm({
            client: payment.client,
            business: payment.business,
            amount: payment.amount,
            method: payment.method,
            date: payment.date,
            status: payment.status,
        });
        setIsCreateOpen(false);
        setErrorMessage("");
        setSuccessMessage("");
        setDeleteTargetId(null);
    }

    function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingPayment) return;
        setPayments((prev) =>
            prev.map((p) => p.id === editingPayment.id ? { ...editForm, id: editingPayment.id } : p)
        );
        setEditingPayment(null);
        setSuccessMessage("Cobro actualizado correctamente.");
    }

    function confirmDelete() {
        if (!deleteTargetId) return;
        setPayments((prev) => prev.filter((p) => p.id !== deleteTargetId));
        setDeleteTargetId(null);
        setEditingPayment(null);
        setSuccessMessage("Cobro eliminado correctamente.");
    }

    return (
        <div className="page-stack">
            <section className="page-hero">
                <div>
                    <h2>Payments</h2>
                    <p>Seguimiento de cobros realizados y pendientes.</p>
                </div>
                <button className="primary-btn" type="button" onClick={() => { setIsCreateOpen(true); setSuccessMessage(""); setErrorMessage(""); }}>
                    Registrar cobro
                </button>
            </section>

            {isCreateOpen && (
                <section className="section-card">
                    <div className="panel-title-row">
                        <h3 className="panel-title">Nuevo cobro</h3>
                        <button type="button" className="secondary-btn" onClick={() => setIsCreateOpen(false)}>Cancelar</button>
                    </div>
                    <form onSubmit={handleCreateSubmit} className="page-stack" style={{ gap: 16 }}>
                        <div className="form-grid">
                            <input className="input" type="text" placeholder="Cliente" value={createForm.client}
                                onChange={(e) => setCreateForm((p) => ({ ...p, client: e.target.value }))} required />
                            <input className="input" type="text" placeholder="Comercio" value={createForm.business}
                                onChange={(e) => setCreateForm((p) => ({ ...p, business: e.target.value }))} required />
                            <input className="input" type="number" min={0} placeholder="Importe (€)" value={createForm.amount}
                                onChange={(e) => setCreateForm((p) => ({ ...p, amount: e.target.value }))} required />
                            <select className="select" value={createForm.method}
                                onChange={(e) => setCreateForm((p) => ({ ...p, method: e.target.value }))}>
                                <option value="">Método de pago</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Bizum">Bizum</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Pendiente">Pendiente</option>
                            </select>
                            <input className="input" type="date" value={createForm.date}
                                onChange={(e) => setCreateForm((p) => ({ ...p, date: e.target.value }))} required />
                            <select className="select" value={createForm.status}
                                onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value as PaymentStatus }))}>
                                <option value="pending">Por cobrar</option>
                                <option value="paid">Pagado</option>
                            </select>
                        </div>
                        {errorMessage && <div className="message-error">{errorMessage}</div>}
                        <div className="message-row">
                            <button className="primary-btn" type="submit">Registrar cobro</button>
                        </div>
                    </form>
                </section>
            )}

            {editingPayment && (
                <section className="section-card">
                    <div className="panel-title-row">
                        <h3 className="panel-title">Editar cobro {editingPayment.id}</h3>
                        <button type="button" className="secondary-btn" onClick={() => setEditingPayment(null)}>Cancelar</button>
                    </div>
                    <form onSubmit={handleEditSubmit} className="page-stack" style={{ gap: 16 }}>
                        <div className="form-grid">
                            <input className="input" type="text" placeholder="Cliente" value={editForm.client}
                                onChange={(e) => setEditForm((p) => ({ ...p, client: e.target.value }))} required />
                            <input className="input" type="text" placeholder="Comercio" value={editForm.business}
                                onChange={(e) => setEditForm((p) => ({ ...p, business: e.target.value }))} required />
                            <input className="input" type="number" min={0} placeholder="Importe (€)" value={editForm.amount}
                                onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))} required />
                            <select className="select" value={editForm.method}
                                onChange={(e) => setEditForm((p) => ({ ...p, method: e.target.value }))}>
                                <option value="">Método de pago</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Bizum">Bizum</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Pendiente">Pendiente</option>
                            </select>
                            <input className="input" type="date" value={editForm.date}
                                onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))} required />
                            <select className="select" value={editForm.status}
                                onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as PaymentStatus }))}>
                                <option value="pending">Por cobrar</option>
                                <option value="paid">Pagado</option>
                            </select>
                        </div>
                        {errorMessage && <div className="message-error">{errorMessage}</div>}
                        <div className="message-row" style={{ display: "flex", gap: 12 }}>
                            <button className="primary-btn" type="submit">Guardar cambios</button>
                            <button type="button" className="danger-btn" onClick={() => setDeleteTargetId(editingPayment.id)}>
                                Eliminar cobro
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {deleteTargetId !== null && (
                <div className="modal-backdrop" role="dialog" aria-modal="true"
                    onClick={(e) => { if (e.target === e.currentTarget) setDeleteTargetId(null); }}>
                    <div className="modal-card">
                        <div className="modal-icon">!</div>
                        <h3 className="modal-title">Eliminar cobro</h3>
                        <p className="modal-text">¿Seguro que quieres eliminar el cobro {deleteTargetId}? Esta acción no se puede deshacer.</p>
                        <div className="modal-actions">
                            <button type="button" className="secondary-btn" onClick={() => setDeleteTargetId(null)}>Cancelar</button>
                            <button type="button" className="danger-btn" onClick={confirmDelete}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            <section className="kpi-grid">
                <KpiCard title="Cobrado hoy" value={`${totalCobrado} €`} subtitle={`${payments.filter(p => p.status === "paid").length} operaciones registradas`} variant="positive" />
                <KpiCard title="Pendiente" value={`${totalPendiente} €`} subtitle={`${payments.filter(p => p.status === "pending").length} cobro(s) por revisar`} variant="warning" />
                <KpiCard title="Método más usado" value={metodoMasUsado} subtitle="Mayor volumen del día" />
                <KpiCard title="Conversión" value={`${conversion}%`} subtitle="Cobros cerrados hoy" />
            </section>

            <section className="section-card">
                <div className="panel-title-row">
                    <h3 className="panel-title">Listado de cobros</h3>
                    <span style={{ color: "#6b7280", fontSize: 14 }}>{filteredPayments.length} resultados</span>
                </div>

                <div className="search-row" style={{ marginBottom: 16 }}>
                    <input className="input" placeholder="Buscar por cliente, comercio o método..." value={search}
                        onChange={(e) => setSearch(e.target.value)} />
                </div>

                {successMessage && <div className="message-success" style={{ marginBottom: 12 }}>{successMessage}</div>}

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Comercio</th>
                            <th>Importe</th>
                            <th>Método</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: "center", padding: 24 }}>No hay resultados.</td></tr>
                        ) : (
                            filteredPayments.map((payment) => (
                                <tr key={payment.id}>
                                    <td style={{ fontWeight: 600 }}>{payment.id}</td>
                                    <td>{payment.client}</td>
                                    <td>{payment.business}</td>
                                    <td>{payment.amount} €</td>
                                    <td>{payment.method}</td>
                                    <td>{payment.date}</td>
                                    <td><Badge status={payment.status} /></td>
                                    <td>
                                        <button type="button" onClick={() => openEditForm(payment)}
                                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, opacity: 0.5 }}
                                            title="Editar cobro">
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