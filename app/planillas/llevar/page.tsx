import { PlanillaOperacionesPage } from "@/lib/components/planillas/PlanillaOperacionesPage";
import { planillaOperacionesDocumentTitle } from "@/lib/planillas/planillaOperacionesConfig";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: planillaOperacionesDocumentTitle("LLEVAR_LAVANDERIA"),
};

export default function PlanillaLlevarPage() {
  return <PlanillaOperacionesPage mode="LLEVAR_LAVANDERIA" />;
}
