"use client";

import { useEffect, useMemo, useState } from "react";
import type { Business, Customer, Review, CreateReviewDto, UpdateReviewDto } from "@/lib/api";
import { createReview, deleteReview, getBusinesses, getCustomers, updateReview } from "@/lib/api";

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange?.(star)}
          style={{
            fontSize: 20,
            cursor: onChange ? "pointer" : "default",
            color: star <= rating ? "#f59e0b" : "#d1d5db",
            transition: "color .15s",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));
  } catch { return date; }
}

export default function ReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews]       = useState<Review[]>(initialReviews);
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const emptyForm: CreateReviewDto = { rating: 5, comment: "", customerId: 0, businessId: 0 };
  const [createForm, setCreateForm]         = useState<CreateReviewDto>(emptyForm);
  const [editForm, setEditForm]             = useState<CreateReviewDto>(emptyForm);
  const [isCreateOpen, setIsCreateOpen]     = useState(false);
  const [editingId, setEditingId]           = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deletingId, setDeletingId]         = useState<number | null>(null);
  const [loadingCreate, setLoadingCreate]   = useState(false);
  const [loadingEdit, setLoadingEdit]       = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage]     = useState("");
  const [ratingFilter, setRatingFilter]     = useState<number | "all">("all");

  useEffect(() => {
    getCustomers().then(setCustomers).catch(console.error);
    getBusinesses().then(setBusinesses).catch(console.error);
  }, []);

  const filteredReviews = useMemo(() => {
    if (ratingFilter === "all") return reviews;
    return reviews.filter((r) => r.rating === ratingFilter);
  }, [reviews, ratingFilter]);

  const totalCount   = reviews.length;
  const avgRating    = totalCount > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / totalCount).toFixed(1) : "—";
  const fiveStars    = reviews.filter((r) => r.rating === 5).length;
  const lowRating    = reviews.filter((r) => r.rating <= 2).length;

  function openCreateForm() {
    setErrorMessage(""); setSuccessMessage("");
    setEditingId(null); setDeleteTargetId(null);
    setCreateForm(emptyForm); setIsCreateOpen(true);
  }

  function closeCreateForm() {
    setErrorMessage(""); setCreateForm(emptyForm); setIsCreateOpen(false);
  }

  function openEditForm(review: Review) {
    setErrorMessage(""); setSuccessMessage("");
    setIsCreateOpen(false); setDeleteTargetId(null);
    setEditingId(review.id);
    setEditForm({ rating: review.rating, comment: review.comment, customerId: review.customerId, businessId: review.businessId });
  }

  function closeEditForm() {
    setErrorMessage(""); setEditingId(null); setEditForm(emptyForm);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoadingCreate(true); setSuccessMessage(""); setErrorMessage("");
    try {
      const created = await createReview(createForm);
      setReviews((prev) => [created, ...prev]);
      setCreateForm(emptyForm); setIsCreateOpen(false);
      setSuccessMessage("Reseña creada correctamente");
    } catch { setErrorMessage("Error al crear la reseña"); }
    finally { setLoadingCreate(false); }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setLoadingEdit(true); setSuccessMessage(""); setErrorMessage("");
    try {
      const payload: UpdateReviewDto = { rating: editForm.rating, comment: editForm.comment };
      const updated = await updateReview(editingId, payload);
      setReviews((prev) => prev.map((r) => r.id === editingId ? updated : r));
      setEditingId(null); setEditForm(emptyForm);
      setSuccessMessage("Reseña actualizada correctamente");
    } catch { setErrorMessage("Error al actualizar la reseña"); }
    finally { setLoadingEdit(false); }
  }

  async function confirmDelete() {
    if (deleteTargetId === null) return;
    setDeletingId(deleteTargetId); setSuccessMessage(""); setErrorMessage("");
    try {
      await deleteReview(deleteTargetId);
      setReviews((prev) => prev.filter((r) => r.id !== deleteTargetId));
      setSuccessMessage("Reseña eliminada correctamente");
      setDeleteTargetId(null);
    } catch { setErrorMessage("Error al eliminar la reseña"); }
    finally { setDeletingId(null); }
  }

  return (
    <div className="page-stack">

      {/* Hero */}
      <section className="page-hero">
        <div>
          <h2>Reseñas</h2>
          <p>Gestiona las valoraciones de tus clientes</p>
        </div>
        <button className="primary-btn" type="button" onClick={openCreateForm}>Nueva reseña</button>
      </section>

      {/* KPIs */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-card__label">Total reseñas</p>
          <h3 className="kpi-card__value">{totalCount}</h3>
          <p className="kpi-card__meta">Registradas</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">Valoración media</p>
          <h3 className="kpi-card__value">{avgRating} ★</h3>
          <p className="kpi-card__meta kpi-card__meta--positive">Sobre 5</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">Reseñas 5 estrellas</p>
          <h3 className="kpi-card__value">{fiveStars}</h3>
          <p className="kpi-card__meta kpi-card__meta--positive">Excelentes</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">Valoraciones bajas</p>
          <h3 className="kpi-card__value">{lowRating}</h3>
          <p className="kpi-card__meta kpi-card__meta--warning">{lowRating > 0 ? "Requieren atención" : "Sin incidencias"}</p>
        </div>
      </section>

      {/* Create form */}
      {isCreateOpen && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">Nueva reseña</h3>
            <button type="button" className="secondary-btn" onClick={closeCreateForm}>Cancelar</button>
          </div>
          <form onSubmit={handleCreateSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <select className="select" value={createForm.customerId} onChange={(e) => setCreateForm(p => ({ ...p, customerId: Number(e.target.value) }))} required>
                <option value={0} disabled>Selecciona cliente</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="select" value={createForm.businessId} onChange={(e) => setCreateForm(p => ({ ...p, businessId: Number(e.target.value) }))} required>
                <option value={0} disabled>Selecciona negocio</option>
                {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Valoración</label>
              <StarRating rating={createForm.rating} onChange={(r) => setCreateForm(p => ({ ...p, rating: r }))} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Comentario</label>
              <textarea
                className="input input--full"
                rows={3}
                value={createForm.comment}
                onChange={(e) => setCreateForm(p => ({ ...p, comment: e.target.value }))}
                placeholder="Escribe el comentario de la reseña..."
                required
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
            {errorMessage && <div className="message-error">{errorMessage}</div>}
            <div className="message-row">
              <button className="primary-btn" type="submit" disabled={loadingCreate}>
                {loadingCreate ? "Guardando..." : "Crear reseña"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Edit form */}
      {editingId !== null && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">Editar reseña #{editingId}</h3>
            <button type="button" className="secondary-btn" onClick={closeEditForm}>Cancelar</button>
          </div>
          <form onSubmit={handleEditSubmit} className="page-stack" style={{ gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Valoración</label>
              <StarRating rating={editForm.rating} onChange={(r) => setEditForm(p => ({ ...p, rating: r }))} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Comentario</label>
              <textarea
                className="input input--full"
                rows={3}
                value={editForm.comment}
                onChange={(e) => setEditForm(p => ({ ...p, comment: e.target.value }))}
                placeholder="Escribe el comentario..."
                required
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
            {errorMessage && <div className="message-error">{errorMessage}</div>}
            <div className="message-row">
              <button className="primary-btn" type="submit" disabled={loadingEdit}>
                {loadingEdit ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Delete modal */}
      {deleteTargetId !== null && (
        <div className="modal-backdrop" role="dialog" aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTargetId(null); }}>
          <div className="modal-card">
            <div className="modal-icon">!</div>
            <h3 className="modal-title">¿Eliminar reseña?</h3>
            <p className="modal-text">Esta acción no se puede deshacer. Se eliminará la reseña #{deleteTargetId}.</p>
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setDeleteTargetId(null)}>Cancelar</button>
              <button type="button" className="danger-btn" onClick={confirmDelete} disabled={deletingId === deleteTargetId}>
                {deletingId === deleteTargetId ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Reseñas registradas</h3>
          <div className="filter-row">
            <button type="button" className={`filter-pill${ratingFilter === "all" ? " filter-pill--active" : ""}`} onClick={() => setRatingFilter("all")}>Todas</button>
            {[5, 4, 3, 2, 1].map((r) => (
              <button key={r} type="button" className={`filter-pill${ratingFilter === r ? " filter-pill--active" : ""}`} onClick={() => setRatingFilter(r)}>
                {r} ★
              </button>
            ))}
          </div>
        </div>

        {successMessage && <div className="message-success" style={{ marginBottom: 12 }}>{successMessage}</div>}
        {errorMessage && <div className="message-error" style={{ marginBottom: 12 }}>{errorMessage}</div>}

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Negocio</th>
              <th>Valoración</th>
              <th>Comentario</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: "32px 0" }}>
                  No hay reseñas registradas
                </td>
              </tr>
            ) : filteredReviews.map((review) => (
              <tr key={review.id}>
                <td style={{ fontWeight: 600 }}>{review.id}</td>
                <td>{customers.find(c => c.id === review.customerId)?.name ?? review.customerId}</td>
                <td>{businesses.find(b => b.id === review.businessId)?.name ?? review.businessId}</td>
                <td><StarRating rating={review.rating} /></td>
                <td style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{review.comment}</td>
                <td>{formatDate(review.createdAt)}</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="secondary-btn" onClick={() => openEditForm(review)}>Editar</button>
                    <button type="button" className="secondary-btn" onClick={() => setDeleteTargetId(review.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
