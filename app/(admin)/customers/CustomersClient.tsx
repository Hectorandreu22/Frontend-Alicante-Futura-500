"use client";

import { useState, useEffect } from "react";
import type { Customer, CreateCustomerDto, UpdateCustomerDto, BusinessOption } from "@/lib/api";
import { createCustomer, updateCustomer, deleteCustomer, getBusinessOptions } from "@/lib/api";
import { getCustomersWithNextAppointment } from "@/lib/api";
import { useI18n } from "@/lib/i18n";


export default function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const { t } = useI18n();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [businessesError, setBusinessesError] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createForm, setCreateForm] = useState<CreateCustomerDto>({ name: "", email: "", phone: "", businessId: 0 });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState<UpdateCustomerDto>({ name: "", email: "", phone: "", businessId: 0 });
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [phoneCreateError, setPhoneCreateError] = useState("");
  const [phoneEditError, setPhoneEditError] = useState("");

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  // Carga clientes con próxima cita y lista de negocios de forma independiente
  useEffect(() => {
    async function fetchData() {
      try {
        const [customersRes, businessOptions] = await Promise.all([
          getCustomersWithNextAppointment(),
          getBusinessOptions(),
        ]);
      
      setCustomers(customersRes);
      setBusinesses(businessOptions);

    // ── Clientes ─────────────────────────────────────────────────────────────
    async function fetchCustomers() {
      try {
        const data = await fetch("/api/customers/with-next-appointment").then(
          (r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json() as Promise<Customer[]>;
          }
        );
        setCustomers(data);
      } catch (err) {
        console.error("Error al cargar clientes:", err);
      }
    } catch (error) {
      console.error("Error de carga", error);
    }
  }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validatePhone(value: string): string {
    if (/[a-zA-Z]/.test(value)) return t("phoneError1");
    const digits = value.replace(/[\s\+\-]/g, "").length;
    if (digits < 9) return t("phoneError2");
    if (digits > 15) return t("phoneError3");
    return "";
  }

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const phoneError = validatePhone(createForm.phone);
    if (phoneError) { setPhoneCreateError(phoneError); return; }
    setLoading(true); setErrorMessage(""); setSuccessMessage("");
    try {
      const created = await createCustomer(createForm);
      setCustomers((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      setCreateForm({ name: "", email: "", phone: "", businessId: businesses[0]?.id ?? 0 });
      setSuccessMessage(t("customerCreated"));
    } catch { setErrorMessage(t("customerCreateError")); }
    finally { setLoading(false); }
  }

  function openEditForm(customer: Customer) {
    setEditingCustomer(customer);
    setEditForm({ name: customer.name, email: customer.email, phone: customer.phone, businessId: customer.businessId });
    setErrorMessage(""); setSuccessMessage(""); setIsCreateOpen(false); setDeleteTargetId(null);
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingCustomer) return;
    const phoneError = validatePhone(editForm.phone ?? "");
    if (phoneError) { setPhoneEditError(phoneError); return; }
    setLoadingEdit(true); setErrorMessage(""); setSuccessMessage("");
    try {
      const updated = await updateCustomer(editingCustomer.id, editForm);
      setCustomers((prev) => prev.map((c) => c.id === editingCustomer.id ? updated : c));
      setEditingCustomer(null);
      setSuccessMessage(t("customerUpdated"));
    } catch { setErrorMessage(t("customerUpdateError")); }
    finally { setLoadingEdit(false); }
  }

  async function confirmDelete() {
    if (deleteTargetId === null) return;
    setLoadingDelete(true); setErrorMessage(""); setSuccessMessage("");
    try {
      await deleteCustomer(deleteTargetId);
      setCustomers((prev) => prev.filter((c) => c.id !== deleteTargetId));
      setDeleteTargetId(null); setEditingCustomer(null);
      setSuccessMessage(t("customerDeleted"));
    } catch { setErrorMessage(t("customerDeleteError")); }
    finally { setLoadingDelete(false); }
  }

  // ─── Selector de negocio reutilizable ────────────────────────────────────────

  function BusinessSelect({
    value,
    onChange,
  }: {
    value: number;
    onChange: (id: number) => void;
  }) {
    if (loadingBusinesses) {
      return (
        <input
          className="input"
          type="text"
          disabled
          placeholder={t("loadingBusinesses")}
          style={{ opacity: 0.6 }}
        />
      );
    }
    if (businessesError || businesses.length === 0) {
      return (
        <input
          className="input"
          type="text"
          disabled
          placeholder={businessesError ? "Error al cargar negocios" : "Sin negocios disponibles"}
          style={{ opacity: 0.6, borderColor: businessesError ? "var(--danger, #e53e3e)" : undefined }}
        />
      );
    }
    return (
      <select
        className="input"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        required
      >
        <option value={0} disabled>
          {t("selectBusiness")}
        </option>
        {businesses.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("customersTitle")}</h2>
          <p>{t("customersSubtitle")}</p>
        </div>
        <button className="primary-btn" type="button" onClick={() => setIsCreateOpen(true)}>{t("newCustomer")}</button>
      </section>

      {isCreateOpen && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">{t("newCustomerTitle")}</h3>
            <button type="button" className="secondary-btn" onClick={() => setIsCreateOpen(false)}>{t("cancelBtn")}</button>
          </div>
          <form onSubmit={handleCreateSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <input className="input" type="text" placeholder={t("colName")} value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} required />
              <input className="input" type="email" placeholder={t("colEmail")} value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} required />
              <div>
                <input className="input" type="tel" placeholder={t("colPhone")} value={createForm.phone}
                  onChange={(e) => { setCreateForm((p) => ({ ...p, phone: e.target.value })); setPhoneCreateError(validatePhone(e.target.value)); }} required />
                {phoneCreateError && <p style={{ color: "red", fontSize: 12, marginTop: 4 }}>{phoneCreateError}</p>}
              </div>
              {/* Selector real de negocio — reemplaza el input numérico anterior */}
              <BusinessSelect
                value={createForm.businessId}
                onChange={(id) => setCreateForm((p) => ({ ...p, businessId: id }))}
              />
            </div>
            {errorMessage && <div className="message-error">{errorMessage}</div>}
            <div className="message-row">
              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? t("savingBtn") : t("createCustomerBtn")}
              </button>
            </div>
          </form>
        </section>
      )}

      {editingCustomer && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">{t("editCustomerTitle")} #{editingCustomer.id}</h3>
            <button type="button" className="secondary-btn" onClick={() => setEditingCustomer(null)}>{t("cancelBtn")}</button>
          </div>
          <form onSubmit={handleEditSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <input className="input" type="text" placeholder={t("colName")} value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} required />
              <input className="input" type="email" placeholder={t("colEmail")} value={editForm.email}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} required />
              <div>
                <input className="input" type="tel" placeholder={t("colPhone")} value={editForm.phone}
                  onChange={(e) => { setEditForm((p) => ({ ...p, phone: e.target.value })); setPhoneEditError(validatePhone(e.target.value)); }} required />
                {phoneEditError && <p style={{ color: "red", fontSize: 12, marginTop: 4 }}>{phoneEditError}</p>}
              </div>
              {/* Selector real de negocio — reemplaza el input numérico anterior */}
              <BusinessSelect
                value={editForm.businessId ?? 0}
                onChange={(id) => setEditForm((p) => ({ ...p, businessId: id }))}
              />
            </div>
            {errorMessage && <div className="message-error">{errorMessage}</div>}
            <div className="message-row" style={{ display: "flex", gap: 12 }}>
              <button className="primary-btn" type="submit" disabled={loadingEdit}>
                {loadingEdit ? t("savingBtn") : t("saveBtn")}
              </button>
              <button type="button" className="danger-btn" onClick={() => setDeleteTargetId(editingCustomer.id)} disabled={loadingDelete}>
                {t("deleteBtn")}
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
            <h3 className="modal-title">{t("deleteCustomerTitle")}</h3>
            <p className="modal-text">{t("deleteCustomerText")}</p>
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setDeleteTargetId(null)}>{t("cancelBtn")}</button>
              <button type="button" className="danger-btn" onClick={confirmDelete} disabled={loadingDelete}>
                {loadingDelete ? t("deletingBtn") : t("deleteBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="section-card">
        <div className="search-row">
          <input className="input" placeholder={t("searchCustomer")} value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
      </section>

      {successMessage && <div className="message-success">{successMessage}</div>}

      <section className="customer-grid">
        {filteredCustomers.length === 0 ? (
          <p>{t("noCustomers")}</p>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="customer-card" style={{ position: "relative" }}>
              <p className="customer-name">{customer.name}</p>
              <p className="customer-meta">{customer.phone}</p>
              <p className="customer-meta">{customer.email}</p>
              {/* Muestra el nombre del negocio si está disponible */}
              {customer.businessId > 0 && (
                <p className="customer-meta" style={{ fontSize: 12, color: "var(--muted)" }}>
                  {businesses.find((b) => b.id === customer.businessId)?.name ?? `#${customer.businessId}`}
                </p>
              )}
              <div className="customer-tag">Siguiente reserva:{" "}
                {customer.nextAppointment
                  ? new Date(customer.nextAppointment).toLocaleDateString()
                  : "Sin citas"}
              </div>
              <button type="button" onClick={() => openEditForm(customer)}
                style={{ position: "absolute", bottom: 12, right: 12, background: "none", border: "none", cursor: "pointer", fontSize: 18, opacity: 0.5 }}
                title={t("editBtn")}>
                ✏️
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}