"use client";

import { useState } from "react";
import type { Business, CreateBusinessDto, UpdateBusinessDto } from "@/lib/api";
import { createBusiness, updateBusiness, deleteBusiness } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const emptyForm: CreateBusinessDto = {
  name: "",
  email: "",
  phone: "",
  service: "",
  price: 0,
};

export default function BusinessesClient({ initialBusinesses }: { initialBusinesses: Business[] }) {
  const { t } = useI18n();
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateBusinessDto>(emptyForm);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [editForm, setEditForm] = useState<UpdateBusinessDto>(emptyForm);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase()) ||
    b.service.toLowerCase().includes(search.toLowerCase())
  );

  function openCreateForm() {
    setIsCreateOpen(true);
    setEditingBusiness(null);
    setDeleteTargetId(null);
    setErrorMessage("");
    setSuccessMessage("");
    setCreateForm(emptyForm);
  }

  function closeCreateForm() {
    setIsCreateOpen(false);
    setCreateForm(emptyForm);
    setErrorMessage("");
  }

  function openEditForm(business: Business) {
    setEditingBusiness(business);
    setEditForm({ name: business.name, email: business.email, phone: business.phone, service: business.service, price: business.price });
    setIsCreateOpen(false);
    setDeleteTargetId(null);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function closeEditForm() {
    setEditingBusiness(null);
    setEditForm(emptyForm);
    setErrorMessage("");
  }

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingCreate(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const created = await createBusiness(createForm);
      setBusinesses((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      setCreateForm(emptyForm);
      setSuccessMessage(t("businessCreated"));
    } catch {
      setErrorMessage(t("businessCreateError"));
    } finally {
      setLoadingCreate(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingBusiness) return;
    setLoadingEdit(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const updated = await updateBusiness(editingBusiness.id, editForm);
      setBusinesses((prev) => prev.map((b) => b.id === editingBusiness.id ? updated : b));
      setEditingBusiness(null);
      setEditForm(emptyForm);
      setSuccessMessage(t("businessUpdated"));
    } catch {
      setErrorMessage(t("businessUpdateError"));
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
      await deleteBusiness(deleteTargetId);
      setBusinesses((prev) => prev.filter((b) => b.id !== deleteTargetId));
      if (editingBusiness?.id === deleteTargetId) closeEditForm();
      setDeleteTargetId(null);
      setSuccessMessage(t("businessDeleted"));
    } catch {
      setErrorMessage(t("businessDeleteError"));
    } finally {
      setLoadingDelete(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("businessesTitle")}</h2>
          <p>{t("businessesSubtitle")}</p>
        </div>
        <button className="primary-btn" type="button" onClick={openCreateForm}>
          {t("newBusiness")}
        </button>
      </section>

      {isCreateOpen && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">{t("createBusinessTitle")}</h3>
            <button type="button" className="secondary-btn" onClick={closeCreateForm}>{t("cancelBtn")}</button>
          </div>
          <form onSubmit={handleCreateSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <input className="input" type="text" placeholder={t("colBusinessName")} value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} required />
              <input className="input" type="email" placeholder={t("colEmail")} value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} required />
              <input className="input" type="tel" placeholder={t("colPhone")} value={createForm.phone}
                onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))} required />
              <input className="input" type="text" placeholder={t("colService2")} value={createForm.service}
                onChange={(e) => setCreateForm((p) => ({ ...p, service: e.target.value }))} required />
              <input className="input" type="number" min={0} step={0.01} placeholder={`${t("colPrice")} (€)`} value={createForm.price}
                onChange={(e) => setCreateForm((p) => ({ ...p, price: parseFloat(e.target.value) }))} required />
            </div>
            {errorMessage && <div className="message-error">{errorMessage}</div>}
            <div className="message-row">
              <button className="primary-btn" type="submit" disabled={loadingCreate}>
                {loadingCreate ? t("savingBtn") : t("createBusinessBtn")}
              </button>
            </div>
          </form>
        </section>
      )}

      {editingBusiness && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">{t("editBusinessTitle")} #{editingBusiness.id}</h3>
            <button type="button" className="secondary-btn" onClick={closeEditForm}>{t("cancelBtn")}</button>
          </div>
          <form onSubmit={handleEditSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <input className="input" type="text" placeholder={t("colBusinessName")} value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} required />
              <input className="input" type="email" placeholder={t("colEmail")} value={editForm.email}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} required />
              <input className="input" type="tel" placeholder={t("colPhone")} value={editForm.phone}
                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} required />
              <input className="input" type="text" placeholder={t("colService2")} value={editForm.service}
                onChange={(e) => setEditForm((p) => ({ ...p, service: e.target.value }))} required />
              <input className="input" type="number" min={0} step={0.01} placeholder={`${t("colPrice")} (€)`} value={editForm.price}
                onChange={(e) => setEditForm((p) => ({ ...p, price: parseFloat(e.target.value) }))} required />
            </div>
            {errorMessage && <div className="message-error">{errorMessage}</div>}
            <div className="message-row" style={{ display: "flex", gap: 12 }}>
              <button className="primary-btn" type="submit" disabled={loadingEdit}>
                {loadingEdit ? t("savingBtn") : t("saveBtn")}
              </button>
              <button type="button" className="danger-btn" onClick={() => setDeleteTargetId(editingBusiness.id)} disabled={loadingDelete}>
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
            <h3 className="modal-title">{t("deleteBusinessTitle")}</h3>
            <p className="modal-text">{t("deleteBusinessText")} #{deleteTargetId}</p>
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
          <input className="input" placeholder={t("searchBusiness")} value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
      </section>

      {successMessage && <div className="message-success">{successMessage}</div>}

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">{t("businessesRegistered")}</h3>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>{filteredBusinesses.length} {t("businessesRegistered").toLowerCase()}</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("colId")}</th>
              <th>{t("colBusinessName")}</th>
              <th>{t("colEmail")}</th>
              <th>{t("colPhone")}</th>
              <th>{t("colService2")}</th>
              <th>{t("colPrice")}</th>
              <th>{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredBusinesses.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 24 }}>{t("noBusinesses")}</td>
              </tr>
            ) : (
              filteredBusinesses.map((business) => (
                <tr key={business.id}>
                  <td style={{ fontWeight: 600 }}>{business.id}</td>
                  <td style={{ fontWeight: 600 }}>{business.name}</td>
                  <td>{business.email}</td>
                  <td>{business.phone}</td>
                  <td>{business.service}</td>
                  <td>{business.price} €</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" className="secondary-btn" onClick={() => openEditForm(business)}>{t("editBtn")}</button>
                      <button type="button" className="danger-btn" onClick={() => setDeleteTargetId(business.id)}>{t("deleteBtn")}</button>
                    </div>
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
