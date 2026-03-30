import { PlanillaPrepararEntregaPage } from "@/lib/components/planillas/PlanillaPrepararEntregaPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preparar para entrega · Local",
};

export default function PlanillaPrepararEntregaRoute() {
  return <PlanillaPrepararEntregaPage />;
}
