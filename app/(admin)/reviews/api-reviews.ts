// ─── Reviews ─────────────────────────────────────────────────────────────────
// Añade estas interfaces y funciones al final de tu archivo lib/api.ts

export interface Review {
  id: number;
  rating: number;        // 1-5
  comment: string;
  customerId: number;
  businessId: number;
  createdAt: string;
}

export interface CreateReviewDto {
  rating: number;
  comment: string;
  customerId: number;
  businessId: number;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

export async function getReviews(): Promise<Review[]> {
  const res = await fetch(`${API_URL}/reviews`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener las reseñas");
  return res.json();
}

export async function createReview(data: CreateReviewDto): Promise<Review> {
  const res = await fetch(`${API_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear la reseña");
  return res.json();
}

export async function updateReview(id: number, data: UpdateReviewDto): Promise<Review> {
  const res = await fetch(`${API_URL}/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar la reseña");
  return res.json();
}

export async function deleteReview(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/reviews/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar la reseña");
}
