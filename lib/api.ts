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
}

export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_URL}/customers`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error al obtener los clientes");
  }

  return res.json();
}

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  export async function getAppointments(): Promise<Booking[]> {
    const res = await fetch(`${API_URL}/appointments`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Error al obtener las reservas");
    }

    return res.json();
  }

  export async function createAppointment(data: CreateBookingDto): Promise<Booking> {
    const res = await fetch(`${API_URL}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al crear la reserva");
    }

    return res.json();
  }

  export async function updateAppointment(
    id: number,
    data: UpdateBookingDto
  ): Promise<Booking> {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al editar la reserva");
    }

    return res.json();
  }

  export async function deleteAppointment(
    id: number
  ): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Error al eliminar la reserva");
    }

    return res.json();
  }

  export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  businessId: number;
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

export async function deleteCustomer(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/customers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar el cliente");
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  businessId?: number;
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