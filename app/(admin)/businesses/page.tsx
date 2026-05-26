import BusinessesClient from "./BusinessesClient";
import { getBusinesses } from "@/lib/api";

export default async function BusinessesPage() {
  const businesses = await getBusinesses();
  return <BusinessesClient initialBusinesses={businesses} />;
}
