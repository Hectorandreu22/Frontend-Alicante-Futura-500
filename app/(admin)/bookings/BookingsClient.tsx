"use client";

import { useMemo, useState } from "react";
import type { Booking, BookingStatus, CreateBookingDto, UpdateBookingDto } from "@/lib/api";
import { createAppointment, deleteAppointment, updateAppointment } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

function StatusBadge({ status, t }: { status: BookingStatus; t: (k: string) => string }) {
  const label = status === "pending" ? t("statusPending") : status === "confirmed" ? t("statusConfirmed") : t("statusPaid");
  return <span className={`badge badge--${status}`}>{label}</span>;
}

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));
  } catch { return date; }
}

export default function BookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
  const { t } = useI18n();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const emptyForm: CreateBookingDto = { date: "", time: "", status: "pending", customerId: 1, businessId: 1, serviceName: "" };

  const [createForm, setCreateForm] = useState<CreateBookingDto>(emptyForm);
  const [editForm, setEditForm] = useState<CreateBookingDto>(emptyForm);
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const paidCount = bookings.filter((b) => b.status === "paid").length;

  function updateCreateForm<K extends keyof CreateBookingDto>(key: K, value: CreateBookingDto[K]) {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateEditForm<K extends keyof CreateBookingDto>(key: K, value: CreateBookingDto[K]) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreateForm() {
    setErrorMessage(""); setSuccessMessage("");
    setEditingBookingId(null); setDeleteTargetId(null);
    setEditForm(emptyForm); setIsCreateOpen(true);
  }

  function closeCreateForm() {
    setErrorMessage(""); setCreateForm(emptyForm); setIsCreateOpen(false);
  }

  function openEditForm(booking: Booking) {
    setErrorMessage(""); setSuccessMessage("");
    setIsCreateOpen(false); setDeleteTargetId(null);
    setEditingBookingId(booking.id);
    setEditForm({ date: booking.date, time: booking.time, status: booking.status, customerId: booking.customerId, businessId: booking.businessId, serviceName: booking.serviceName });
  }

  function closeEditForm() {
    setErrorMessage(""); setEditingBookingId(null); setEditForm(emptyForm);
  }

  function openDeleteModal(id: number) {
    setErrorMessage(""); setSuccessMessage(""); setDeleteTargetId(id);
  }

  function closeDeleteModal() { setDeleteTargetId(null); }

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingCreate(true); setSuccessMessage(""); setErrorMessage("");
    try {
      const created = await createAppointment(createForm);
      setBookings((prev) => [created, ...prev]);
      setCreateForm(emptyForm); setIsCreateOpen(false);
      setSuccessMessage(t("bookingCreated"));
    } catch { setErrorMessage(t("bookingCreateError")); }
    finally { setLoadingCreate(false); }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingBookingId) return;
    setLoadingEdit(true); setSuccessMessage(""); setErrorMessage("");
    try {
      const payload: UpdateBookingDto = { ...editForm };
      const updated = await updateAppointment(editingBookingId, payload);
      setBookings((prev) => prev.map((b) => b.id === editingBookingId ? updated : b));
      setEditingBookingId(null); setEditForm(emptyForm);
      setSuccessMessage(t("bookingUpdated"));
    } catch { setErrorMessage(t("bookingUpdateError")); }
    finally { setLoadingEdit(false); }
  }

  async function confirmDelete() {
    if (deleteTargetId === null) return;
    setDeletingBookingId(deleteTargetId); setSuccessMessage(""); setErrorMessage("");
    try {
      await deleteAppointment(deleteTargetId);
      setBookings((prev) => prev.filter((b) => b.id !== deleteTargetId));
      if (editingBookingId === deleteTargetId) closeEditForm();
      setSuccessMessage(t("bookingDeleted")); closeDeleteModal();
    } catch { setErrorMessage(t("bookingDeleteError")); }
    finally { setDeletingBookingId(null); }
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("bookingsTitle")}</h2>
          <p>{t("bookingsSubtitle")}</p>
        </div>
        <button className="primary-btn" type="button" onClick={openCreateForm}>{t("newBooking")}</button>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-card__label">{t("totalBookings")}</p>
          <h3 className="kpi-card__value">{totalCount}</h3>
          <p className="kpi-card__meta">{t("totalBookingsMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("pendingBookings")}</p>
          <h3 className="kpi-card__value">{pendingCount}</h3>
          <p className="kpi-card__meta kpi-card__meta--warning">{t("pendingBookingsMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("confirmedBookings")}</p>
          <h3 className="kpi-card__value">{confirmedCount}</h3>
          <p className="kpi-card__meta kpi-card__meta--positive">{t("confirmedBookingsMeta")}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("paidBookings")}</p>
          <h3 className="kpi-card__value">{paidCount}</h3>
          <p className="kpi-card__meta">{t("paidBookingsMeta")}</p>
        </div>
      </section>

      {isCreateOpen && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">{t("createBookingTitle")}</h3>
            <button type="button" className="secondary-btn" onClick={closeCreateForm}>{t("cancelBtn")}</button>
          </div>
          <form onSubmit={handleCreateSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <input className="input" type="date" value={createForm.date} onChange={(e) => updateCreateForm("date", e.target.value)} required />
              <input className="input" type="time" value={createForm.time} onChange={(e) => updateCreateForm("time", e.target.value)} required />
              <select className="select" value={createForm.status} onChange={(e) => updateCreateForm("status", e.target.value as BookingStatus)}>
                <option value="pending">{t("statusPending")}</option>
                <option value="confirmed">{t("statusConfirmed")}</option>
                <option value="paid">{t("statusPaid")}</option>
              </select>
              <input className="input" type="number" min={1} value={createForm.customerId} onChange={(e) => updateCreateForm("customerId", Number(e.target.value))} placeholder="Customer ID" required />
              <input className="input" type="number" min={1} value={createForm.businessId} onChange={(e) => updateCreateForm("businessId", Number(e.target.value))} placeholder="Business ID" required />
              <input className="input input--full" type="text" value={createForm.serviceName} onChange={(e) => updateCreateForm("serviceName", e.target.value)} placeholder={t("colService")} required />
            </div>
            {errorMessage && <div className="message-error">{errorMessage}</div>}
            <div className="message-row">
              <button className="primary-btn" type="submit" disabled={loadingCreate}>
                {loadingCreate ? t("savingBtn") : t("createBookingBtn")}
              </button>
            </div>
          </form>
        </section>
      )}

      {editingBookingId !== null && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">{t("editBookingTitle")} #{editingBookingId}</h3>
            <button type="button" className="secondary-btn" onClick={closeEditForm}>{t("cancelBtn")}</button>
          </div>
          <form onSubmit={handleEditSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <input className="input" type="date" value={editForm.date} onChange={(e) => updateEditForm("date", e.target.value)} required />
              <input className="input" type="time" value={editForm.time} onChange={(e) => updateEditForm("time", e.target.value)} required />
              <select className="select" value={editForm.status} onChange={(e) => updateEditForm("status", e.target.value as BookingStatus)}>
                <option value="pending">{t("statusPending")}</option>
                <option value="confirmed">{t("statusConfirmed")}</option>
                <option value="paid">{t("statusPaid")}</option>
              </select>
              <input className="input" type="number" min={1} value={editForm.customerId} onChange={(e) => updateEditForm("customerId", Number(e.target.value))} placeholder="Customer ID" required />
              <input className="input" type="number" min={1} value={editForm.businessId} onChange={(e) => updateEditForm("businessId", Number(e.target.value))} placeholder="Business ID" required />
              <input className="input input--full" type="text" value={editForm.serviceName} onChange={(e) => updateEditForm("serviceName", e.target.value)} placeholder={t("colService")} required />
            </div>
            {errorMessage && <div className="message-error">{errorMessage}</div>}
            <div className="message-row">
              <button className="primary-btn" type="submit" disabled={loadingEdit}>
                {loadingEdit ? t("savingBtn") : t("saveBtn")}
              </button>
            </div>
          </form>
        </section>
      )}

      {deleteTargetId !== null && (
        <div className="modal-backdrop" role="dialog" aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal(); }}>
          <div className="modal-card">
            <div className="modal-icon">!</div>
            <h3 className="modal-title">{t("deleteBookingTitle")}</h3>
            <p className="modal-text">{t("deleteBookingText")} #{deleteTargetId}</p>
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={closeDeleteModal}>{t("cancelBtn")}</button>
              <button type="button" className="danger-btn" onClick={confirmDelete} disabled={deletingBookingId === deleteTargetId}>
                {deletingBookingId === deleteTargetId ? t("deletingBtn") : t("deleteBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">{t("registeredBookings")}</h3>
          <div className="filter-row">
            <button type="button" className={`filter-pill${statusFilter === "all" ? " filter-pill--active" : ""}`} onClick={() => setStatusFilter("all")}>{t("filterAll")}</button>
            <button type="button" className={`filter-pill${statusFilter === "pending" ? " filter-pill--active" : ""}`} onClick={() => setStatusFilter("pending")}>{t("filterPending")}</button>
            <button type="button" className={`filter-pill${statusFilter === "confirmed" ? " filter-pill--active" : ""}`} onClick={() => setStatusFilter("confirmed")}>{t("filterConfirmed")}</button>
            <button type="button" className={`filter-pill${statusFilter === "paid" ? " filter-pill--active" : ""}`} onClick={() => setStatusFilter("paid")}>{t("filterPaid")}</button>
          </div>
        </div>

        {successMessage && <div className="message-success" style={{ marginBottom: 12 }}>{successMessage}</div>}
        {errorMessage && <div className="message-error" style={{ marginBottom: 12 }}>{errorMessage}</div>}

        <table className="data-table">
          <thead>
            <tr>
              <th>{t("colId")}</th>
              <th>{t("colDate")}</th>
              <th>{t("colTime2")}</th>
              <th>{t("colService")}</th>
              <th>{t("colClient")}</th>
              <th>{t("colBusiness")}</th>
              <th>{t("colStatusLabel")}</th>
              <th>{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td style={{ fontWeight: 600 }}>{booking.id}</td>
                <td>{formatDate(booking.date)}</td>
                <td>{booking.time}</td>
                <td>{booking.serviceName}</td>
                <td>{booking.customerId}</td>
                <td>{booking.businessId}</td>
                <td><StatusBadge status={booking.status} t={t} /></td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="secondary-btn" onClick={() => openEditForm(booking)}>{t("editBtn")}</button>
                    <button type="button" className="secondary-btn" onClick={() => openDeleteModal(booking.id)}>{t("deleteBtn")}</button>
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