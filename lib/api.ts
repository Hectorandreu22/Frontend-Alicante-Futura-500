export type BookingStatus = "pending" | "confirmed" | "paid";

export interface Booking {
  id: number;
  date: string;
  time: string;
  status: BookingStatus;
  customerId: number;
  businessId: number;
  serviceName: string;
}

export interface CreateBookingDto {
  date: string;
  time: string;
  status: BookingStatus;
  customerId: number;
  businessId: number;
  serviceName: string;
}

export interface UpdateBookingDto {
  date?: string;
  time?: string;
  status?: BookingStatus;
  customerId?: number;
  businessId?: number;
  serviceName?: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  nextAppointment: string | null;
  businessId: number;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  businessId: number;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  businessId?: number;
}

export async function getCustomersWithNextAppointment(): Promise<Customer[]> {
  const res = await fetch(`${API_URL}/customers/with-next-appointment`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener los clientes con citas");
  return res.json();
}

// ─── Business & Services ────────────────────────────────────────────────────

/**
 * Representa un servicio individual de un negocio.
 * Cada servicio tiene su propio nombre y precio.
 */
export interface BusinessService {
  id?: number;       // Opcional en creación; presente tras persistir en BD
  name: string;
  price: number;
}

/**
 * Negocio con soporte para múltiples servicios.
 * Los campos `service` y `price` anteriores han sido reemplazados
 * por el array `services` para permitir N servicios por negocio.
 */
export interface Business {
  id: number;
  name: string;
  email: string;
  phone: string;
  services: BusinessService[];
}

/**
 * DTO para crear un nuevo negocio.
 * Se envía al menos un servicio en el array `services`.
 */
export interface CreateBusinessDto {
  name: string;
  email: string;
  phone: string;
  address: string;
  zipcode: string;
  maxCustomers: number;
  services: BusinessService[];
}

/**
 * DTO para actualizar un negocio existente.
 * Todos los campos son opcionales; `services` reemplaza
 * la lista completa de servicios si se incluye.
 */
export interface UpdateBusinessDto {
  name?: string;
  email?: string;
  phone?: string;
  services?: BusinessService[];
}

/**
 * Versión simplificada de Business para selectores (id + name).
 * Usada en CustomersClient para el selector de negocio.
 */
export interface BusinessOption {
  id: number;
  name: string;
}

// ─── API URL ─────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function getAppointments(): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/appointments`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener las reservas");
  return res.json();
}

export async function createAppointment(data: CreateBookingDto): Promise<Booking> {
  const res = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear la reserva");
  return res.json();
}

export async function updateAppointment(id: number, data: UpdateBookingDto): Promise<Booking> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al editar la reserva");
  return res.json();
}

export async function deleteAppointment(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/appointments/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar la reserva");
  return res.json();
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_URL}/customers`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener los clientes");
  return res.json();
}

export async function createCustomer(data: CreateCustomerDto): Promise<Customer> {
  const res = await fetch(`${API_URL}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear el cliente");
  return res.json();
}

export async function updateCustomer(id: number, data: UpdateCustomerDto): Promise<Customer> {
  const res = await fetch(`${API_URL}/customers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar el cliente");
  return res.json();
}

export async function deleteCustomer(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/customers/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar el cliente");
}

// ─── Businesses ───────────────────────────────────────────────────────────────

export async function getBusinesses(): Promise<Business[]> {
  const res = await fetch(`${API_URL}/businesses`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener los negocios");
  return res.json();
}

/**
 * Obtiene la lista de negocios en formato simplificado (id + name)
 * para usar en selectores sin cargar los servicios completos.
 */
export async function getBusinessOptions(): Promise<BusinessOption[]> {
  // Usamos la ruta API de Next.js (/api/businesses) para evitar problemas de CORS
  // cuando esta función se llama desde el cliente (puerto 3001 → puerto 3000).
  const res = await fetch("/api/businesses", { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener los negocios");
  const businesses: Business[] = await res.json();
  return businesses.map(({ id, name }) => ({ id, name }));
}

/*export async function createBusiness(data: CreateBusinessDto): Promise<Business> {
  const res = await fetch(`${API_URL}/businesses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear el negocio");
  return res.json();
}*/

export async function createBusiness(data: CreateBusinessDto): Promise<Business> {
  const res = await fetch(`${API_URL}/businesses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    console.error("Error del backend:", error); // 👈 añade esto
    throw new Error("Error al crear el negocio");
  }
  return res.json();
}

export async function updateBusiness(id: number, data: UpdateBusinessDto): Promise<Business> {
  const res = await fetch(`${API_URL}/businesses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar el negocio");
  return res.json();
}

export async function deleteBusiness(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/businesses/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar el negocio");
}