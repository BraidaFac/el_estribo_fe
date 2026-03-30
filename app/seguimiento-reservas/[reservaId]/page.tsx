import { ReservaSeguimientoDetallePage } from "@/lib/components/seguimiento/ReservaSeguimientoDetallePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detalle de reserva · El Estribo",
};

export default function SeguimientoReservaDetalleRoutePage() {
  return <ReservaSeguimientoDetallePage />;
}
