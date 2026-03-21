import { PlanillaOperacionesPage } from "@/lib/components/planillas/PlanillaOperacionesPage";
import { planillaOperacionesDocumentTitle } from "@/lib/planillas/planillaOperacionesConfig";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: planillaOperacionesDocumentTitle("RETIROS_CLIENTES"),
};

export default function PlanillaRetirarPage() {
  return <PlanillaOperacionesPage mode="RETIROS_CLIENTES" />;
}
