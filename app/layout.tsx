import "./globals.css";
import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Bookings Admin",
  description: "Base inicial del proyecto de gestión de reservas",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}