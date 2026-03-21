import { PlanillaOperacionesPage } from "@/lib/components/planillas/PlanillaOperacionesPage";
import { planillaOperacionesDocumentTitle } from "@/lib/planillas/planillaOperacionesConfig";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: planillaOperacionesDocumentTitle("DEVOLUCIONES_CLIENTES"),
};

export default function PlanillaRetirosPage() {
  return <PlanillaOperacionesPage mode="DEVOLUCIONES_CLIENTES" />;
}
