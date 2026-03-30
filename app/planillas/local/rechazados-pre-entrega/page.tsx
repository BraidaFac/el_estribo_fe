import { PlanillaRechazadosPreEntregaPage } from "@/lib/components/planillas/PlanillaRechazadosPreEntregaPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rechazados pre-entrega · Local",
};

export default function PlanillaRechazadosPreEntregaRoute() {
  return <PlanillaRechazadosPreEntregaPage />;
}
