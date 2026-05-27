"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Booking, Customer, Business } from "@/lib/api";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type View = "month" | "week" | "day";

type BookingStatus = "pending" | "confirmed" | "paid" | "cancelled" | "completed";

interface CalendarBooking extends Omit<Booking, "status"> {
  status: BookingStatus;
  customerName?: string;
  businessName?: string;
  price?: number;
  durationMinutes?: number;
  color?: string;
}

interface DragState {
  bookingId: number;
  offsetMinutes: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; border: string; text: string; dot: string }> = {
  confirmed:  { label: "Confirmada",  bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.4)",  text: "#059669", dot: "#10b981" },
  pending:    { label: "Pendiente",   bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.4)",  text: "#d97706", dot: "#f59e0b" },
  paid:       { label: "Pagada",      bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.4)",  text: "#6366f1", dot: "#818cf8" },
  cancelled:  { label: "Cancelada",   bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.4)",   text: "#dc2626", dot: "#ef4444" },
  completed:  { label: "Completada",  bg: "rgba(20,184,166,0.12)", border: "rgba(20,184,166,0.4)",  text: "#0d9488", dot: "#14b8a6" },
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function pad(n: number) { return String(n).padStart(2, "0"); }
function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}
function fromMinutes(mins: number) {
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// ─── Mini Calendar ─────────────────────────────────────────────────────────────

function MiniCalendar({ selected, onChange, bookingDates }: { selected: Date; onChange: (d: Date) => void; bookingDates: Set<string> }) {
  const [viewMonth, setViewMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const today = new Date();

  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i));

  return (
    <div style={{ padding: "0 0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: "4px 8px", borderRadius: 6, fontSize: 16, lineHeight: 1 }}>‹</button>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
          {MONTHS_ES[viewMonth.getMonth()].slice(0, 3)} {viewMonth.getFullYear()}
        </span>
        <button onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: "4px 8px", borderRadius: 6, fontSize: 16, lineHeight: 1 }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {["L","M","X","J","V","S","D"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 500, padding: "2px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selected);
          const key = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
          const hasBookings = bookingDates.has(key);
          return (
            <button key={i} onClick={() => onChange(date)}
              style={{
                background: isSelected ? "var(--cal-accent)" : isToday ? "rgba(16,185,129,0.08)" : "none",
                border: isToday && !isSelected ? "1px solid var(--cal-accent)" : "1px solid transparent",
                borderRadius: 6, cursor: "pointer", padding: "4px 2px", position: "relative",
                color: isSelected ? "#fff" : "var(--color-text-primary)", fontSize: 12,
                transition: "all 0.15s ease",
              }}>
              {date.getDate()}
              {hasBookings && !isSelected && (
                <span style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "var(--cal-accent)", display: "block" }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500,
      padding: "2px 8px", borderRadius: 20, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ─── Booking Card (week/day view) ─────────────────────────────────────────────

function BookingCard({
  booking, topPct, heightPct, onClick, onDragStart, compact,
}: {
  booking: CalendarBooking; topPct: number; heightPct: number;
  onClick: () => void; onDragStart: (e: React.DragEvent) => void; compact?: boolean;
}) {
  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const duration = booking.durationMinutes ?? 60;
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        position: "absolute", left: 2, right: 2,
        top: `${topPct}%`, height: `${Math.max(heightPct, 2.5)}%`,
        background: cfg.bg, border: `1.5px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.dot}`,
        borderRadius: 6, padding: compact ? "2px 6px" : "4px 8px",
        cursor: "grab", overflow: "hidden", zIndex: 10,
        transition: "box-shadow 0.15s ease, transform 0.1s ease",
        userSelect: "none",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.01)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
    >
      <div style={{ fontSize: compact ? 10 : 11, fontWeight: 500, color: cfg.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {booking.time} · {booking.customerName ?? `#${booking.customerId}`}
      </div>
      {!compact && (
        <div style={{ fontSize: 10, color: "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>
          {booking.serviceName} · {duration}min
        </div>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function BookingModal({
  booking, customers, businesses, onClose, onSave, onDelete, isNew,
}: {
  booking: Partial<CalendarBooking>; customers: Customer[]; businesses: Business[];
  onClose: () => void; onSave: (b: Partial<CalendarBooking>) => void;
  onDelete?: () => void; isNew: boolean;
}) {
  const [form, setForm] = useState<Partial<CalendarBooking>>({ ...booking });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 16, padding: "28px 28px 24px", width: "100%", maxWidth: 480, boxShadow: "0 24px 48px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{isNew ? "Nueva reserva" : "Editar reserva"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-secondary)", lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Fecha</label>
              <input type="date" value={form.date ?? ""} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 13, background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Hora</label>
              <input type="time" value={form.time ?? ""} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 13, background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Cliente</label>
            <select value={form.customerId ?? ""} onChange={e => {
              const c = customers.find(c => c.id === Number(e.target.value));
              setForm(p => ({ ...p, customerId: Number(e.target.value), customerName: c?.name }));
            }} style={{ width: "100%", padding: "7px 10px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 13, background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }}>
              <option value="">Seleccionar cliente</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Negocio</label>
            <select value={form.businessId ?? ""} onChange={e => {
              const b = businesses.find(b => b.id === Number(e.target.value));
              setForm(p => ({ ...p, businessId: Number(e.target.value), businessName: b?.name }));
            }} style={{ width: "100%", padding: "7px 10px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 13, background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }}>
              <option value="">Seleccionar negocio</option>
              {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Servicio</label>
            <input type="text" value={form.serviceName ?? ""} onChange={e => setForm(p => ({ ...p, serviceName: e.target.value }))}
              placeholder="Nombre del servicio"
              style={{ width: "100%", padding: "7px 10px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 13, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", boxSizing: "border-box" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Duración (min)</label>
              <input type="number" min={15} step={15} value={form.durationMinutes ?? 60} onChange={e => setForm(p => ({ ...p, durationMinutes: Number(e.target.value) }))}
                style={{ width: "100%", padding: "7px 10px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 13, background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Precio (€)</label>
              <input type="number" min={0} step={0.01} value={form.price ?? 0} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) }))}
                style={{ width: "100%", padding: "7px 10px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 13, background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Estado</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(Object.keys(STATUS_CONFIG) as BookingStatus[]).map(s => (
                <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))}
                  style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: "pointer",
                    background: form.status === s ? STATUS_CONFIG[s].bg : "transparent",
                    border: `1.5px solid ${form.status === s ? STATUS_CONFIG[s].border : "var(--color-border-tertiary)"}`,
                    color: form.status === s ? STATUS_CONFIG[s].text : "var(--color-text-secondary)",
                    transition: "all 0.15s",
                  }}>
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "space-between" }}>
          {!isNew && onDelete && (
            <button onClick={onDelete}
              style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#dc2626", fontWeight: 500 }}>
              Eliminar
            </button>
          )}
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-primary)" }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, cursor: saving ? "default" : "pointer", background: "var(--cal-accent)", border: "none", color: "#fff", fontWeight: 500, opacity: saving ? 0.7 : 1, transition: "opacity 0.15s" }}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Day / Week time grid ─────────────────────────────────────────────────────

function TimeGrid({
  days, bookings, onSlotClick, onBookingClick, onDrop,
}: {
  days: Date[]; bookings: CalendarBooking[];
  onSlotClick: (date: Date, hour: number) => void;
  onBookingClick: (b: CalendarBooking) => void;
  onDrop: (bookingId: number, date: Date, newMinutes: number) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const now = new Date();
  const totalMins = 24 * 60;
  const nowPct = (now.getHours() * 60 + now.getMinutes()) / totalMins * 100;

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); }

  function handleDropOnDay(e: React.DragEvent, date: Date) {
    e.preventDefault();
    if (!dragRef.current || !gridRef.current) return;
    const col = (e.currentTarget as HTMLDivElement);
    const rect = col.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const rawMins = Math.round(pct * totalMins / 15) * 15;
    const newMins = rawMins - (dragRef.current.offsetMinutes ?? 0);
    onDrop(dragRef.current.bookingId, date, Math.max(0, Math.min(23 * 60 + 45, newMins)));
    dragRef.current = null;
  }

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Hour labels */}
      <div style={{ width: 52, flexShrink: 0, borderRight: "0.5px solid var(--color-border-tertiary)", position: "relative" }}>
        <div style={{ height: 40 }} />
        {HOURS.map(h => (
          <div key={h} style={{ height: "calc((100% - 40px) / 24)", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 10, paddingTop: 2 }}>
            <span style={{ fontSize: 10, color: "var(--color-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
              {h === 0 ? "" : `${pad(h)}:00`}
            </span>
          </div>
        ))}
      </div>

      {/* Day columns */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }} ref={gridRef}>
        {days.map((day, dayIdx) => {
          const isToday = isSameDay(day, now);
          const dayBookings = bookings.filter(b => {
            const bd = new Date(b.date);
            return isSameDay(bd, day);
          });

          return (
            <div key={dayIdx} style={{ flex: 1, borderRight: dayIdx < days.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", position: "relative", minWidth: 0 }}
              onDragOver={handleDragOver}
              onDrop={e => handleDropOnDay(e, day)}>

              {/* Day header */}
              <div style={{
                height: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                borderBottom: "0.5px solid var(--color-border-tertiary)",
                background: isToday ? "rgba(16,185,129,0.04)" : "transparent",
              }}>
                <span style={{ fontSize: 10, color: "var(--color-text-secondary)", fontWeight: 500 }}>{DAYS_ES[(day.getDay() + 6) % 7]}</span>
                <span style={{
                  fontSize: 18, fontWeight: isToday ? 500 : 400, lineHeight: 1.2,
                  color: isToday ? "var(--cal-accent)" : "var(--color-text-primary)",
                  background: isToday ? "rgba(16,185,129,0.12)" : "transparent",
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {day.getDate()}
                </span>
              </div>

              {/* Hour grid */}
              <div style={{ position: "relative", height: "calc(100% - 40px)" }}
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientY - rect.top) / rect.height;
                  const hour = Math.floor(pct * 24);
                  onSlotClick(day, hour);
                }}>

                {HOURS.map(h => (
                  <div key={h} style={{
                    position: "absolute", left: 0, right: 0,
                    top: `${(h / 24) * 100}%`, height: `${(1 / 24) * 100}%`,
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                    borderTop: h % 2 === 0 ? "0.5px solid var(--color-border-tertiary)" : "none",
                  }} />
                ))}

                {/* Current time indicator */}
                {isToday && (
                  <div style={{ position: "absolute", left: 0, right: 0, top: `${nowPct}%`, zIndex: 20, pointerEvents: "none" }}>
                    <div style={{ height: 2, background: "var(--cal-accent)", position: "relative" }}>
                      <div style={{ position: "absolute", left: -4, top: -3, width: 8, height: 8, borderRadius: "50%", background: "var(--cal-accent)" }} />
                    </div>
                  </div>
                )}

                {/* Booking cards */}
                {dayBookings.map(b => {
                  const startM = toMinutes(b.time);
                  const dur = b.durationMinutes ?? 60;
                  const topPct = (startM / totalMins) * 100;
                  const heightPct = (dur / totalMins) * 100;
                  return (
                    <BookingCard key={b.id} booking={b}
                      topPct={topPct} heightPct={heightPct}
                      compact={dur < 30}
                      onClick={() => onBookingClick(b)}
                      onDragStart={e => {
                        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                        const clickOffsetPct = (e.clientY - rect.top) / rect.height;
                        dragRef.current = { bookingId: b.id, offsetMinutes: Math.round(clickOffsetPct * dur) };
                        e.dataTransfer.effectAllowed = "move";
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({ date, bookings, onDayClick, onBookingClick }: {
  date: Date; bookings: CalendarBooking[];
  onDayClick: (d: Date) => void; onBookingClick: (b: CalendarBooking) => void;
}) {
  const today = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(date.getFullYear(), date.getMonth(), i));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        {DAYS_ES.map(d => (
          <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridTemplateRows: `repeat(${Math.ceil(cells.length / 7)}, 1fr)`, flex: 1, overflow: "hidden" }}>
        {cells.map((cellDate, i) => {
          const isToday = cellDate ? isSameDay(cellDate, today) : false;
          const isCurrentMonth = cellDate !== null;
          const dayBookings = cellDate ? bookings.filter(b => isSameDay(new Date(b.date), cellDate)) : [];
          return (
            <div key={i}
              onClick={() => cellDate && onDayClick(cellDate)}
              style={{
                borderRight: i % 7 !== 6 ? "0.5px solid var(--color-border-tertiary)" : "none",
                borderBottom: "0.5px solid var(--color-border-tertiary)",
                padding: "6px 8px",
                cursor: cellDate ? "pointer" : "default",
                background: isToday ? "rgba(16,185,129,0.03)" : "transparent",
                overflow: "hidden",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (cellDate) (e.currentTarget as HTMLDivElement).style.background = "var(--color-background-secondary)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isToday ? "rgba(16,185,129,0.03)" : "transparent"; }}>

              {cellDate && (
                <>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: isToday ? "var(--cal-accent)" : "transparent",
                    color: isToday ? "#fff" : isCurrentMonth ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                    fontSize: 12, fontWeight: isToday ? 500 : 400, marginBottom: 4,
                  }}>
                    {cellDate.getDate()}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {dayBookings.slice(0, 3).map(b => {
                      const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                      return (
                        <div key={b.id}
                          onClick={e => { e.stopPropagation(); onBookingClick(b); }}
                          style={{
                            fontSize: 10, padding: "1px 5px", borderRadius: 3,
                            background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            cursor: "pointer", transition: "opacity 0.1s",
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = "0.8"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}>
                          {b.time} {b.customerName ?? b.serviceName}
                        </div>
                      );
                    })}
                    {dayBookings.length > 3 && (
                      <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>+{dayBookings.length - 3} más</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  selectedDate, bookings, customers, businesses, onDateChange, onBookingClick, onNewBooking,
}: {
  selectedDate: Date; bookings: CalendarBooking[]; customers: Customer[]; businesses: Business[];
  onDateChange: (d: Date) => void; onBookingClick: (b: CalendarBooking) => void; onNewBooking: () => void;
}) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
  const todayBookings = bookings.filter(b => b.date === todayStr).sort((a, b) => a.time.localeCompare(b.time));
  const upcoming = bookings
    .filter(b => b.date > todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 4);
  const pendingRevenue = bookings.filter(b => b.status === "confirmed" || b.status === "pending").reduce((s, b) => s + (b.price ?? 0), 0);
  const todayRevenue = bookings.filter(b => b.date === todayStr && b.status === "paid").reduce((s, b) => s + (b.price ?? 0), 0);

  const bookingDates = new Set(bookings.map(b => b.date));

  return (
    <div style={{
      width: 240, flexShrink: 0, borderLeft: "0.5px solid var(--color-border-tertiary)",
      display: "flex", flexDirection: "column", overflowY: "auto", padding: "16px 16px 24px",
    }}>
      <MiniCalendar selected={selectedDate} onChange={onDateChange} bookingDates={bookingDates} />

      <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 16, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Cobrado hoy", value: `${todayRevenue.toFixed(0)}€`, color: "var(--cal-accent)" },
            { label: "Pendiente", value: `${pendingRevenue.toFixed(0)}€`, color: "#f59e0b" },
            { label: "Reservas hoy", value: String(todayBookings.length), color: "var(--color-text-primary)" },
            { label: "Negocios", value: String(businesses.length), color: "var(--color-text-secondary)" },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px 10px" }}>
              <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 2 }}>{kpi.label}</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 4 }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Hoy</p>
        {todayBookings.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic" }}>Sin reservas</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {todayBookings.map(b => {
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              return (
                <div key={b.id} onClick={() => onBookingClick(b)} style={{
                  padding: "7px 10px", borderRadius: 8, cursor: "pointer",
                  background: cfg.bg, border: `0.5px solid ${cfg.border}`,
                  borderLeft: `3px solid ${cfg.dot}`, transition: "opacity 0.15s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = "0.85"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: cfg.text }}>{b.time} · {b.customerName ?? `#${b.customerId}`}</div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 1 }}>{b.serviceName}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {upcoming.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Próximas</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {upcoming.map(b => {
              const d = new Date(b.date);
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              return (
                <div key={b.id} onClick={() => onBookingClick(b)} style={{
                  padding: "7px 10px", borderRadius: 8, cursor: "pointer",
                  border: "0.5px solid var(--color-border-tertiary)", transition: "background 0.1s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--color-background-secondary)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>{d.getDate()} {MONTHS_ES[d.getMonth()].slice(0,3)} · {b.time}</div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                    {b.customerName ?? `#${b.customerId}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CalendarClient({
  initialBookings = [],
  customers = [],
  businesses = [],
}: {
  initialBookings?: Booking[];
  customers?: Customer[];
  businesses?: Business[];
}) {
  const [view, setView] = useState<View>("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<CalendarBooking[]>(() =>
    initialBookings.map(b => ({
      ...b,
      status: b.status as BookingStatus,
      durationMinutes: 60,
      customerName: customers.find(c => c.id === b.customerId)?.name,
      businessName: businesses.find(biz => biz.id === b.businessId)?.name,
    }))
  );
  const [modal, setModal] = useState<{ booking: Partial<CalendarBooking>; isNew: boolean } | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">("all");
  const [filterBusiness, setFilterBusiness] = useState<number | "all">("all");
  const [loading, setLoading] = useState(false);

  // Refresh from API
  useEffect(() => {
    setLoading(true);
    getAppointments()
      .then(data => {
        setBookings(data.map(b => ({
          ...b,
          status: b.status as BookingStatus,
          durationMinutes: 60,
          customerName: customers.find(c => c.id === b.customerId)?.name,
          businessName: businesses.find(biz => biz.id === b.businessId)?.name,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBookings = bookings.filter(b => {
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (filterBusiness !== "all" && b.businessId !== filterBusiness) return false;
    if (search) {
      const q = search.toLowerCase();
      return (b.customerName?.toLowerCase().includes(q) || b.serviceName?.toLowerCase().includes(q) || b.businessName?.toLowerCase().includes(q));
    }
    return true;
  });

  // Navigation
  function navigate(dir: -1 | 1) {
    setSelectedDate(prev => {
      const d = new Date(prev);
      if (view === "day") d.setDate(d.getDate() + dir);
      else if (view === "week") d.setDate(d.getDate() + dir * 7);
      else { d.setMonth(d.getMonth() + dir); d.setDate(1); }
      return d;
    });
  }

  function goToday() { setSelectedDate(new Date()); }

  // Days for week view
  const weekDays = view === "week"
    ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate), i))
    : [selectedDate];

  // Header label
  function headerLabel() {
    if (view === "month") return `${MONTHS_ES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    if (view === "week") {
      const start = startOfWeek(selectedDate);
      const end = addDays(start, 6);
      if (start.getMonth() === end.getMonth()) return `${MONTHS_ES[start.getMonth()]} ${start.getFullYear()}`;
      return `${MONTHS_ES[start.getMonth()].slice(0,3)} – ${MONTHS_ES[end.getMonth()].slice(0,3)} ${end.getFullYear()}`;
    }
    return `${selectedDate.getDate()} ${MONTHS_ES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  }

  // Open modal for new booking
  function openNewBooking(date?: Date, hour?: number) {
    const d = date ?? selectedDate;
    const time = hour !== undefined ? `${pad(hour)}:00` : "09:00";
    setModal({
      isNew: true,
      booking: {
        date: `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,
        time,
        status: "pending",
        durationMinutes: 60,
        price: 0,
        customerId: customers[0]?.id ?? 1,
        businessId: businesses[0]?.id ?? 1,
        serviceName: "",
        customerName: customers[0]?.name,
        businessName: businesses[0]?.name,
      },
    });
  }

  function openEditBooking(b: CalendarBooking) {
    setModal({ isNew: false, booking: { ...b } });
  }

  async function handleSave(form: Partial<CalendarBooking>) {
    try {
      if (modal?.isNew) {
        const created = await createAppointment({
          date: form.date!,
          time: form.time!,
          status: form.status as "pending" | "confirmed" | "paid",
          customerId: form.customerId!,
          businessId: form.businessId!,
          serviceName: form.serviceName ?? "",
        });
        setBookings(prev => [...prev, {
          ...created,
          status: created.status as BookingStatus,
          durationMinutes: form.durationMinutes ?? 60,
          price: form.price ?? 0,
          customerName: customers.find(c => c.id === created.customerId)?.name,
          businessName: businesses.find(b => b.id === created.businessId)?.name,
        }]);
      } else if (form.id) {
        const updated = await updateAppointment(form.id, {
          date: form.date,
          time: form.time,
          status: form.status as "pending" | "confirmed" | "paid",
          customerId: form.customerId,
          businessId: form.businessId,
          serviceName: form.serviceName,
        });
        setBookings(prev => prev.map(b => b.id === updated.id ? {
          ...updated,
          status: updated.status as BookingStatus,
          durationMinutes: form.durationMinutes ?? b.durationMinutes ?? 60,
          price: form.price ?? b.price ?? 0,
          customerName: customers.find(c => c.id === updated.customerId)?.name,
          businessName: businesses.find(biz => biz.id === updated.businessId)?.name,
        } : b));
      }
    } catch {}
    setModal(null);
  }

  async function handleDelete() {
    if (!modal?.booking?.id) return;
    try {
      await deleteAppointment(modal.booking.id);
      setBookings(prev => prev.filter(b => b.id !== modal.booking.id));
    } catch {}
    setModal(null);
  }

  const handleDrop = useCallback((bookingId: number, date: Date, newMinutes: number) => {
    const dateStr = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
    const newTime = fromMinutes(newMinutes);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, date: dateStr, time: newTime } : b));
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      updateAppointment(bookingId, { date: dateStr, time: newTime }).catch(() => {});
    }
  }, [bookings]);

  return (
    <>
      <style>{`
        :root { --cal-accent: #10b981; }
        @media (prefers-color-scheme: dark) { :root { --cal-accent: #34d399; } }
        .cal-view-btn { background: transparent; border: 0.5px solid var(--color-border-tertiary); cursor: pointer; padding: 5px 14px; font-size: 12px; color: var(--color-text-secondary); transition: all 0.15s; }
        .cal-view-btn:first-child { border-radius: 8px 0 0 8px; }
        .cal-view-btn:last-child { border-radius: 0 8px 8px 0; }
        .cal-view-btn:not(:first-child) { border-left: none; }
        .cal-view-btn.active { background: var(--cal-accent); color: #fff; border-color: var(--cal-accent); }
        .cal-view-btn:not(.active):hover { background: var(--color-background-secondary); color: var(--color-text-primary); }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", maxHeight: "calc(100vh - 60px)", overflow: "hidden", fontFamily: "var(--font-sans)" }}>

        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: "10px 20px",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          background: "var(--color-background-primary)", flexShrink: 0, flexWrap: "wrap",
        }}>
          {/* Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={goToday} style={{ padding: "5px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "transparent", cursor: "pointer", fontSize: 12, color: "var(--color-text-primary)", fontWeight: 500 }}>Hoy</button>
            <button onClick={() => navigate(-1)} style={{ width: 28, height: 28, borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)", background: "transparent", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
            <button onClick={() => navigate(1)} style={{ width: 28, height: 28, borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)", background: "transparent", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
            <span style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", minWidth: 180 }}>{headerLabel()}</span>
          </div>

          {/* View switcher */}
          <div style={{ display: "flex" }}>
            {(["day","week","month"] as View[]).map(v => (
              <button key={v} className={`cal-view-btn${view === v ? " active" : ""}`} onClick={() => setView(v)}>
                {v === "day" ? "Día" : v === "week" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 120, maxWidth: 240 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--color-text-secondary)", pointerEvents: "none" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar reserva..."
              style={{ width: "100%", paddingLeft: 30, paddingRight: 10, height: 30, border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 12, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", boxSizing: "border-box" }} />
          </div>

          {/* Filters */}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as BookingStatus | "all")}
            style={{ height: 30, padding: "0 8px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 12, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", cursor: "pointer" }}>
            <option value="all">Todos los estados</option>
            {(Object.keys(STATUS_CONFIG) as BookingStatus[]).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
          </select>

          {businesses.length > 0 && (
            <select value={filterBusiness} onChange={e => setFilterBusiness(e.target.value === "all" ? "all" : Number(e.target.value))}
              style={{ height: 30, padding: "0 8px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 12, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", cursor: "pointer" }}>
              <option value="all">Todos los negocios</option>
              {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}

          {loading && <span style={{ fontSize: 11, color: "var(--color-text-secondary)", marginLeft: "auto" }}>Actualizando...</span>}

          {/* New booking button */}
          <button onClick={() => openNewBooking()}
            style={{
              marginLeft: "auto", height: 30, padding: "0 16px", borderRadius: 8, border: "none",
              background: "var(--cal-accent)", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}>
            + Nueva reserva
          </button>
        </div>

        {/* Status legend */}
        <div style={{ display: "flex", gap: 16, padding: "6px 20px", borderBottom: "0.5px solid var(--color-border-tertiary)", flexShrink: 0, flexWrap: "wrap" }}>
          {(Object.keys(STATUS_CONFIG) as BookingStatus[]).map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}
                onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: filterStatus === s ? cfg.text : "var(--color-text-secondary)", fontWeight: filterStatus === s ? 500 : 400 }}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Calendar area */}
          <div style={{ flex: 1, overflow: view === "month" ? "hidden" : "auto", display: "flex", flexDirection: "column" }}>
            {view === "month" ? (
              <MonthView
                date={selectedDate}
                bookings={filteredBookings}
                onDayClick={d => { setSelectedDate(d); setView("day"); }}
                onBookingClick={openEditBooking}
              />
            ) : (
              <TimeGrid
                days={weekDays}
                bookings={filteredBookings}
                onSlotClick={(date, hour) => openNewBooking(date, hour)}
                onBookingClick={openEditBooking}
                onDrop={handleDrop}
              />
            )}
          </div>

          {/* Sidebar */}
          <Sidebar
            selectedDate={selectedDate}
            bookings={bookings}
            customers={customers}
            businesses={businesses}
            onDateChange={d => { setSelectedDate(d); if (view === "month") setView("day"); }}
            onBookingClick={openEditBooking}
            onNewBooking={() => openNewBooking()}
          />
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <BookingModal
          booking={modal.booking}
          customers={customers}
          businesses={businesses}
          isNew={modal.isNew}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={modal.isNew ? undefined : handleDelete}
        />
      )}
    </>
  );
}
