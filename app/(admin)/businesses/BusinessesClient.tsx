"use client";

import { useState } from "react";
import type { Business, BusinessService, CreateBusinessDto, UpdateBusinessDto } from "@/lib/api";
import { createBusiness, updateBusiness, deleteBusiness } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { getTokenPayload } from "@/lib/auth";

const emptyService = (): BusinessService => ({ name: "", price: 0 });

const emptyCreateForm = (): CreateBusinessDto => ({
  name: "",
  email: "",
  phone: "",
  address: "",
  zipcode: "",
  maxCustomers: 0,
  services: [emptyService()],
});

export default function BusinessesClient({ initialBusinesses }: { initialBusinesses: Business[] }) {
  const { t } = useI18n();
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateBusinessDto>(emptyCreateForm());
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [editForm, setEditForm] = useState<UpdateBusinessDto>({});
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase())
  );

  function openCreateForm() {
    setIsCreateOpen(true);
    setEditingBusiness(null);
    setDeleteTargetId(null);
    setErrorMessage("");
    setSuccessMessage("");
    setCreateForm(emptyCreateForm());
  }

  function closeCreateForm() {
    setIsCreateOpen(false);
    setCreateForm(emptyCreateForm());
    setErrorMessage("");
  }

  function openEditForm(business: Business) {
    setEditingBusiness(business);
    setEditForm({
      name: business.name,
      email: business.email,
      phone: business.phone,
      services: business.services?.map((s) => ({ ...s })) ?? [emptyService()],
    });
    setIsCreateOpen(false);
    setDeleteTargetId(null);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function closeEditForm() {
    setEditingBusiness(null);
    setEditForm({});
    setErrorMessage("");
  }

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  // Validación: todos los servicios deben tener nombre
  if (createForm.services.some((s) => !s.name.trim())) {
    setErrorMessage(t("serviceNameRequired"));
    return;
  }
  setLoadingCreate(true);
  setErrorMessage("");
  setSuccessMessage("");
  try {
    const payload = getTokenPayload();       // 👈 lee el token
    if (!payload) {
      setErrorMessage("No hay sesión activa");
      return;
    }
    const created = await createBusiness({ ...createForm, email: payload.email }); // 👈 añade el email
    setBusinesses((prev) => [created, ...prev]);
    setIsCreateOpen(false);
    setCreateForm(emptyCreateForm());
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
      setEditForm({});
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
              <input className="input" type="text" placeholder={t("colBusinessName")}
                value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} required />
              <input className="input" type="tel" placeholder={t("colPhone")}
                value={createForm.phone} onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))} required />
              <input className="input" type="text" placeholder="Dirección"
                value={createForm.address} onChange={(e) => setCreateForm((p) => ({ ...p, address: e.target.value }))} required />
              <input className="input" type="text" placeholder="Código postal"
                value={createForm.zipcode} onChange={(e) => setCreateForm((p) => ({ ...p, zipcode: e.target.value }))} required />
              <input className="input" type="number" placeholder="Máximo clientes"
                value={createForm.maxCustomers} onChange={(e) => setCreateForm((p) => ({ ...p, maxCustomers: parseInt(e.target.value) || 0 }))} required />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Servicios</span>
                <button type="button" className="secondary-btn" style={{ fontSize: 13, padding: "4px 12px" }}
                  onClick={() => setCreateForm((p) => ({ ...p, services: [...p.services, emptyService()] }))}>
                  + Añadir servicio
                </button>
              </div>
              {createForm.services.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <input className="input" type="text" placeholder="Nombre servicio" value={s.name}
                    onChange={(e) => setCreateForm((p) => ({ ...p, services: p.services.map((sv, idx) => idx === i ? { ...sv, name: e.target.value } : sv) }))} required style={{ flex: 2 }} />
                  <input className="input" type="number" placeholder="Precio €" value={s.price}
                    onChange={(e) => setCreateForm((p) => ({ ...p, services: p.services.map((sv, idx) => idx === i ? { ...sv, price: parseFloat(e.target.value) || 0 } : sv) }))} required style={{ flex: 1 }} />
                  <button type="button" className="danger-btn" style={{ padding: "4px 10px" }}
                    onClick={() => setCreateForm((p) => ({ ...p, services: p.services.filter((_, idx) => idx !== i) }))}
                    disabled={createForm.services.length === 1}>X</button>
                </div>
              ))}
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
              <input className="input" type="text" placeholder={t("colBusinessName")} value={editForm.name ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} required />
              <input className="input" type="email" placeholder={t("colEmail")} value={editForm.email ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} required />
              <input className="input" type="tel" placeholder={t("colPhone")} value={editForm.phone ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} required />
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
              <th>Servicios</th>
              <th>{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredBusinesses.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>{t("noBusinesses")}</td>
              </tr>
            ) : (
              filteredBusinesses.map((business) => (
                <tr key={business.id}>
                  <td style={{ fontWeight: 600 }}>{business.id}</td>
                  <td style={{ fontWeight: 600 }}>{business.name}</td>
                  <td>{business.email}</td>
                  <td>{business.phone}</td>
                  <td>
                    {(business.services ?? []).map((s, i) => (
                      <span key={i} style={{ display: "block", fontSize: 13 }}>{s.name} - {s.price}€</span>
                    ))}
                  </td>
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