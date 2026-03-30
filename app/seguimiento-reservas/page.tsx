import { SeguimientoReservasListPage } from "@/lib/components/seguimiento/SeguimientoReservasListPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seguimiento de reservas · El Estribo",
};

export default function SeguimientoReservasPage() {
  return <SeguimientoReservasListPage />;
}
