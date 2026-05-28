"use client";

import { useState } from "react";
import type {
  Business,
  BusinessService,
  CreateBusinessDto,
  UpdateBusinessDto,
} from "@/lib/api";
import { createBusiness, updateBusiness, deleteBusiness } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { getTokenPayload } from "@/lib/auth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const emptyService = (): BusinessService => ({ name: "", price: 0 });

const emptyCreateForm = (): CreateBusinessDto => ({
  name: "",
  email: "",
  phone: "",
  services: [emptyService()],
});

// ─── Sub-component: ServiceRows ───────────────────────────────────────────────
// Gestiona la lista dinámica de servicios dentro del formulario.

interface ServiceRowsProps {
  services: BusinessService[];
  onChange: (services: BusinessService[]) => void;
}

function ServiceRows({ services, onChange }: ServiceRowsProps) {
  const { t } = useI18n();

  function updateService(index: number, field: keyof BusinessService, value: string | number) {
    const updated = services.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    onChange(updated);
  }

  function addService() {
    onChange([...services, emptyService()]);
  }

  function removeService(index: number) {
    if (services.length === 1) return; // Siempre al menos un servicio
    onChange(services.filter((_, i) => i !== index));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--muted)" }}>
          {t("colService2")}
        </span>
        <button
          type="button"
          className="secondary-btn"
          onClick={addService}
          style={{ fontSize: 13, padding: "4px 12px" }}
        >
          + {t("addServiceBtn")}
        </button>
      </div>

      {services.map((service, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            background: "var(--surface, #f8f8f8)",
            borderRadius: 8,
            padding: "8px 12px",
          }}
        >
          <input
            className="input"
            type="text"
            placeholder={t("colService2")}
            value={service.name}
            onChange={(e) => updateService(index, "name", e.target.value)}
            required
            style={{ flex: 2 }}
          />
          <input
            className="input"
            type="number"
            min={0}
            step={0.01}
            placeholder={`${t("colPrice")} (€)`}
            value={service.price}
            onChange={(e) => updateService(index, "price", parseFloat(e.target.value) || 0)}
            required
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="danger-btn"
            onClick={() => removeService(index)}
            disabled={services.length === 1}
            style={{ fontSize: 13, padding: "4px 10px", opacity: services.length === 1 ? 0.4 : 1 }}
            title={t("deleteBtn")}
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BusinessesClient({
  initialBusinesses,
}: {
  initialBusinesses: Business[];
}) {
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

  // ─── Búsqueda: comprueba nombre, email y cualquier nombre de servicio ────────
  const filteredBusinesses = businesses.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      (b.services ?? []).some((s) => s.name.toLowerCase().includes(q))
    );
  });

  // ─── Crear ───────────────────────────────────────────────────────────────────

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


  // ─── Editar ──────────────────────────────────────────────────────────────────

  function openEditForm(business: Business) {
    setEditingBusiness(business);
    setEditForm({
      name: business.name,
      email: business.email,
      phone: business.phone,
      // Copia profunda para no mutar el estado original
      services:
        business.services && business.services.length > 0
          ? business.services.map((s) => ({ ...s }))
          : [emptyService()],
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

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingBusiness) return;
    // Validación: todos los servicios deben tener nombre
    if ((editForm.services ?? []).some((s) => !s.name.trim())) {
      setErrorMessage(t("serviceNameRequired"));
      return;
    }
    setLoadingEdit(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const updated = await updateBusiness(editingBusiness.id, editForm);
      setBusinesses((prev) =>
        prev.map((b) => (b.id === editingBusiness.id ? updated : b))
      );
      setEditingBusiness(null);
      setEditForm({});
      setSuccessMessage(t("businessUpdated"));
    } catch {
      setErrorMessage(t("businessUpdateError"));
    } finally {
      setLoadingEdit(false);
    }
  }

  // ─── Eliminar ────────────────────────────────────────────────────────────────

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

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="page-stack">
      {/* Header */}
      <section className="page-hero">
        <div>
          <h2>{t("businessesTitle")}</h2>
          <p>{t("businessesSubtitle")}</p>
        </div>
        <button className="primary-btn" type="button" onClick={openCreateForm}>
          {t("newBusiness")}
        </button>
      </section>

      {/* Formulario crear */}
      {isCreateOpen && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">{t("createBusinessTitle")}</h3>
            <button type="button" className="secondary-btn" onClick={closeCreateForm}>
              {t("cancelBtn")}
            </button>
          </div>
          <form onSubmit={handleCreateSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <input
                className="input"
                type="text"
                placeholder={t("colBusinessName")}
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <input
                className="input"
                type="email"
                placeholder={t("colEmail")}
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
              <input
                className="input"
                type="tel"
                placeholder={t("colPhone")}
                value={createForm.phone}
                onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                required
              />
            </div>

            {/* Servicios dinámicos */}
            <ServiceRows
              services={createForm.services}
              onChange={(services) => setCreateForm((p) => ({ ...p, services }))}
            />

            {errorMessage && <div className="message-error">{errorMessage}</div>}
            <div className="message-row">
              <button className="primary-btn" type="submit" disabled={loadingCreate}>
                {loadingCreate ? t("savingBtn") : t("createBusinessBtn")}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Formulario editar */}
      {editingBusiness && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">
              {t("editBusinessTitle")} #{editingBusiness.id}
            </h3>
            <button type="button" className="secondary-btn" onClick={closeEditForm}>
              {t("cancelBtn")}
            </button>
          </div>
          <form onSubmit={handleEditSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <input
                className="input"
                type="text"
                placeholder={t("colBusinessName")}
                value={editForm.name ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <input
                className="input"
                type="email"
                placeholder={t("colEmail")}
                value={editForm.email ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
              <input
                className="input"
                type="tel"
                placeholder={t("colPhone")}
                value={editForm.phone ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                required
              />
            </div>

            {/* Servicios dinámicos */}
            <ServiceRows
              services={editForm.services ?? [emptyService()]}
              onChange={(services) => setEditForm((p) => ({ ...p, services }))}
            />

            {errorMessage && <div className="message-error">{errorMessage}</div>}
            <div className="message-row" style={{ display: "flex", gap: 12 }}>
              <button className="primary-btn" type="submit" disabled={loadingEdit}>
                {loadingEdit ? t("savingBtn") : t("saveBtn")}
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={() => setDeleteTargetId(editingBusiness.id)}
                disabled={loadingDelete}
              >
                {t("deleteBtn")}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Modal confirmar eliminación */}
      {deleteTargetId !== null && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTargetId(null);
          }}
        >
          <div className="modal-card">
            <div className="modal-icon">!</div>
            <h3 className="modal-title">{t("deleteBusinessTitle")}</h3>
            <p className="modal-text">
              {t("deleteBusinessText")} #{deleteTargetId}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setDeleteTargetId(null)}
              >
                {t("cancelBtn")}
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={confirmDelete}
                disabled={loadingDelete}
              >
                {loadingDelete ? t("deletingBtn") : t("deleteBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buscador */}
      <section className="section-card">
        <div className="search-row">
          <input
            className="input"
            placeholder={t("searchBusiness")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {successMessage && <div className="message-success">{successMessage}</div>}

      {/* Tabla de negocios */}
      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">{t("businessesRegistered")}</h3>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>
            {filteredBusinesses.length} {t("businessesRegistered").toLowerCase()}
          </span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("colId")}</th>
              <th>{t("colBusinessName")}</th>
              <th>{t("colEmail")}</th>
              <th>{t("colPhone")}</th>
              <th>{t("colService2")}</th>
              <th>{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredBusinesses.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                  {t("noBusinesses")}
                </td>
              </tr>
            ) : (
              filteredBusinesses.map((business) => (
                <tr key={business.id}>
                  <td style={{ fontWeight: 600 }}>{business.id}</td>
                  <td style={{ fontWeight: 600 }}>{business.name}</td>
                  <td>{business.email}</td>
                  <td>{business.phone}</td>
                  <td>
                    {/* Muestra cada servicio con su precio en líneas separadas */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {(business.services ?? []).length === 0 ? (
                        <span style={{ color: "var(--muted)", fontSize: 13 }}>—</span>
                      ) : (
                        (business.services ?? []).map((s, i) => (
                          <span key={i} style={{ fontSize: 13 }}>
                            {s.name}{" "}
                            <span style={{ color: "var(--muted)" }}>
                              {s.price.toFixed(2)} €
                            </span>
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => openEditForm(business)}
                      >
                        {t("editBtn")}
                      </button>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => setDeleteTargetId(business.id)}
                      >
                        {t("deleteBtn")}
                      </button>
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