import { PlanillaRetirarLavanderiaPage } from "@/lib/components/planillas/PlanillaRetirarLavanderiaPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retirar de Lavandería",
};

export default function PlanillaDevolverPage() {
  return <PlanillaRetirarLavanderiaPage />;
}
