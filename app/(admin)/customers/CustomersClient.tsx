"use client";

import { useState } from "react";
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from "@/lib/api";
import { createCustomer, updateCustomer, deleteCustomer } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const { t } = useI18n();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createForm, setCreateForm] = useState<CreateCustomerDto>({ name: "", email: "", phone: "", businessId: 1 });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState<UpdateCustomerDto>({ name: "", email: "", phone: "", businessId: 1 });
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
      setCreateForm({ name: "", email: "", phone: "", businessId: 1 });
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
              <input className="input" type="number" min={1} placeholder="Business ID" value={createForm.businessId}
                onChange={(e) => setCreateForm((p) => ({ ...p, businessId: Number(e.target.value) }))} required />
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
              <input className="input" type="number" min={1} placeholder="Business ID" value={editForm.businessId}
                onChange={(e) => setEditForm((p) => ({ ...p, businessId: Number(e.target.value) }))} required />
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
              <div className="customer-tag">Business ID: {customer.businessId}</div>
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