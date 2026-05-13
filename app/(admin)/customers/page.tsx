import { getCustomers } from "@/lib/api";
import CustomersClient from "./CustomersClient";

export default async function CustomersPage() {
  const customers = await getCustomers();
  return <CustomersClient initialCustomers={customers} />;
}