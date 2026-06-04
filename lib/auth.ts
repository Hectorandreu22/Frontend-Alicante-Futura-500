
<<<<<<< HEAD
export function getTokenPayload(): { email: string; sub: number } | null {
=======
export function getTokenPayload(): { email: string; sub: number, role: string } | null {
>>>>>>> main
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}