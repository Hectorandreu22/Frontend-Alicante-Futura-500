"use client";

import { useState } from "react";
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from "@/lib/api";
import { createCustomer, updateCustomer, deleteCustomer } from "@/lib/api";

export default function CustomersClient({
    initialCustomers,
}: {
    initialCustomers: Customer[];
}) {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [createForm, setCreateForm] = useState<CreateCustomerDto>({
        name: "", email: "", phone: "", businessId: 1,
    });
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [editForm, setEditForm] = useState<UpdateCustomerDto>({
        name: "", email: "", phone: "", businessId: 1,
    });
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [phoneCreateError, setPhoneCreateError] = useState("");
    const [phoneEditError, setPhoneEditError] = useState("");

    function validatePhone(value: string): string {
        if (/[a-zA-Z]/.test(value)) return "Introduce un número de teléfono válido (No se admiten letras)";
        if (value.replace(/[\s\+\-]/g, "").length < 9) return "Introduce un número de teléfono válido (9 dígitos)";
        if (value.replace(/[\s\+\-]/g, "").length > 9) return "Introduce un número de teléfono válido (9 dígitos)";
        return "";
    }

    const filteredCustomers = customers.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const phoneError = validatePhone(createForm.phone);
        if (phoneError) {
            setPhoneCreateError(phoneError);
            return;
        }
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            const created = await createCustomer(createForm);
            setCustomers((prev) => [created, ...prev]);
            setIsCreateOpen(false);
            setCreateForm({ name: "", email: "", phone: "", businessId: 1 });
            setSuccessMessage("Cliente creado correctamente.");
        } catch {
            setErrorMessage("No se pudo crear el cliente.");
        } finally {
            setLoading(false);
        }
    }

    function openEditForm(customer: Customer) {
        setEditingCustomer(customer);
        setEditForm({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            businessId: customer.businessId,
        });
        setErrorMessage("");
        setSuccessMessage("");
        setIsCreateOpen(false);
        setDeleteTargetId(null);
    }

    async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const phoneError = validatePhone(editForm.phone ?? "");
        if (phoneError) {
            setPhoneEditError(phoneError);
            return;
        }
        if (!editingCustomer) return;
        setLoadingEdit(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            const updated = await updateCustomer(editingCustomer.id, editForm);
            setCustomers((prev) =>
                prev.map((c) => (c.id === editingCustomer.id ? updated : c))
            );
            setEditingCustomer(null);
            setSuccessMessage("Cliente actualizado correctamente.");
        } catch {
            setErrorMessage("No se pudo actualizar el cliente.");
        } finally {
            setLoadingEdit(false);
        }
    }

    async function confirmDelete() {
        if (deleteTargetId === null) return;
        setLoadingDelete(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            await deleteCustomer(deleteTargetId);
            setCustomers((prev) => prev.filter((c) => c.id !== deleteTargetId));
            setDeleteTargetId(null);
            setEditingCustomer(null);
            setSuccessMessage("Cliente eliminado correctamente.");
        } catch {
            setErrorMessage("No se pudo eliminar el cliente.");
        } finally {
            setLoadingDelete(false);
        }
    }

    return (
        <div className="page-stack">
            <section className="page-hero">
                <div>
                    <h2>Customer directory</h2>
                    <p>Gestión visual de clientes y próximas reservas.</p>
                </div>
                <button className="primary-btn" type="button" onClick={() => setIsCreateOpen(true)}>
                    Nuevo cliente
                </button>
            </section>

            {isCreateOpen && (
                <section className="section-card">
                    <div className="panel-title-row">
                        <h3 className="panel-title">Nuevo cliente</h3>
                        <button type="button" className="secondary-btn" onClick={() => setIsCreateOpen(false)}>Cancelar</button>
                    </div>
                    <form onSubmit={handleCreateSubmit} className="page-stack" style={{ gap: 16 }}>
                        <div className="form-grid">
                            <input className="input" type="text" placeholder="Nombre" value={createForm.name}
                                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} required />
                            <input className="input" type="email" placeholder="Email" value={createForm.email}
                                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} required />
                            <div>
                                <input className="input" type="tel" placeholder="Teléfono (ej: 600 123 456)" value={createForm.phone}
                                    onChange={(e) => {
                                        setCreateForm((p) => ({ ...p, phone: e.target.value }));
                                        setPhoneCreateError(validatePhone(e.target.value));
                                    }}
                                    required />
                                {phoneCreateError && <p style={{ color: "red", fontSize: 12, marginTop: 4 }}>{phoneCreateError}</p>}
                            </div>
                            <input className="input" type="number" min={1} placeholder="Business ID" value={createForm.businessId}
                                onChange={(e) => setCreateForm((p) => ({ ...p, businessId: Number(e.target.value) }))} required />
                        </div>
                        {errorMessage && <div className="message-error">{errorMessage}</div>}
                        <div className="message-row">
                            <button className="primary-btn" type="submit" disabled={loading}>
                                {loading ? "Guardando..." : "Crear cliente"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {editingCustomer && (
                <section className="section-card">
                    <div className="panel-title-row">
                        <h3 className="panel-title">Editar cliente #{editingCustomer.id}</h3>
                        <button type="button" className="secondary-btn" onClick={() => setEditingCustomer(null)}>Cancelar</button>
                    </div>
                    <form onSubmit={handleEditSubmit} className="page-stack" style={{ gap: 16 }}>
                        <div className="form-grid">
                            <input className="input" type="text" placeholder="Nombre" value={editForm.name}
                                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} required />
                            <input className="input" type="email" placeholder="Email" value={editForm.email}
                                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} required />
                            <div>
                                <input className="input" type="tel" placeholder="Teléfono (ej: 600 123 456)" value={editForm.phone}
                                    onChange={(e) => {
                                        setEditForm((p) => ({ ...p, phone: e.target.value }));
                                        setPhoneEditError(validatePhone(e.target.value));
                                    }}
                                    required />
                                {phoneEditError && <p style={{ color: "red", fontSize: 12, marginTop: 4 }}>{phoneEditError}</p>}
                            </div>
                            <input className="input" type="number" min={1} placeholder="Business ID" value={editForm.businessId}
                                onChange={(e) => setEditForm((p) => ({ ...p, businessId: Number(e.target.value) }))} required />
                        </div>
                        {errorMessage && <div className="message-error">{errorMessage}</div>}
                        <div className="message-row" style={{ display: "flex", gap: 12 }}>
                            <button className="primary-btn" type="submit" disabled={loadingEdit}>
                                {loadingEdit ? "Guardando..." : "Guardar cambios"}
                            </button>
                            <button
                                type="button"
                                className="danger-btn"
                                onClick={() => setDeleteTargetId(editingCustomer.id)}
                                disabled={loadingDelete}
                            >
                                Eliminar cliente
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {deleteTargetId !== null && (
                <div
                    className="modal-backdrop"
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => { if (e.target === e.currentTarget) setDeleteTargetId(null); }}
                >
                    <div className="modal-card">
                        <div className="modal-icon">!</div>
                        <h3 className="modal-title">Eliminar cliente</h3>
                        <p className="modal-text">
                            ¿Seguro que quieres eliminar este cliente? Esta acción no se puede deshacer.
                        </p>
                        <div className="modal-actions">
                            <button type="button" className="secondary-btn" onClick={() => setDeleteTargetId(null)}>
                                Cancelar
                            </button>
                            <button type="button" className="danger-btn" onClick={confirmDelete} disabled={loadingDelete}>
                                {loadingDelete ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section className="section-card">
                <div className="search-row">
                    <input className="input" placeholder="Buscar cliente..." value={search}
                        onChange={(e) => setSearch(e.target.value)} />
                </div>
            </section>

            {successMessage && <div className="message-success">{successMessage}</div>}

            <section className="customer-grid">
                {filteredCustomers.length === 0 ? (
                    <p>No hay clientes registrados.</p>
                ) : (
                    filteredCustomers.map((customer) => (
                        <div key={customer.id} className="customer-card" style={{ position: "relative" }}>
                            <p className="customer-name">{customer.name}</p>
                            <p className="customer-meta">{customer.phone}</p>
                            <p className="customer-meta">{customer.email}</p>
                            <div className="customer-tag">Business ID: {customer.businessId}</div>
                            <button
                                type="button"
                                onClick={() => openEditForm(customer)}
                                style={{
                                    position: "absolute",
                                    bottom: 12,
                                    right: 12,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 18,
                                    opacity: 0.5,
                                }}
                                title="Editar cliente"
                            >
                                ✏️
                            </button>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}