import CalendarClient from "./CalendarClient";
import { getAppointments, getCustomers, getBusinesses } from "@/lib/api";

export default async function CalendarPage() {
  const [bookings, customers, businesses] = await Promise.all([
    getAppointments(),
    getCustomers(),
    getBusinesses(),
  ]);

  return (
    <CalendarClient
      initialBookings={bookings}
      customers={customers}
      businesses={businesses}
    />
  );
}
