import type { NextRequest } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function GET(_req: NextRequest) {
  // Intentar el endpoint específico del backend
  const specificRes = await fetch(
    `${BACKEND}/customers/with-next-appointment`,
    { cache: "no-store" }
  );

  if (specificRes.ok) {
    const data = await specificRes.json();
    return Response.json(data);
  }

  // Fallback: devolver clientes normales si el endpoint específico falla (500, 404…)
  const fallbackRes = await fetch(`${BACKEND}/customers`, {
    cache: "no-store",
  });

  if (!fallbackRes.ok) {
    return Response.json(
      { error: "No se pudieron obtener los clientes" },
      { status: fallbackRes.status }
    );
  }

  // Mapear para añadir nextAppointment: null si no viene del backend
  const customers = await fallbackRes.json();
  const normalized = customers.map((c: object) => ({
    nextAppointment: null,
    ...c,
  }));

  return Response.json(normalized);
}
