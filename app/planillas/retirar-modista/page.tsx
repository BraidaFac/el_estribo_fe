import { PlanillaOperacionesPage } from "@/lib/components/planillas/PlanillaOperacionesPage";
import { planillaOperacionesDocumentTitle } from "@/lib/planillas/planillaOperacionesConfig";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: planillaOperacionesDocumentTitle("RETIRAR_MODISTA"),
};

export default function PlanillaRetirarModistaPage() {
  return <PlanillaOperacionesPage mode="RETIRAR_MODISTA" />;
}
