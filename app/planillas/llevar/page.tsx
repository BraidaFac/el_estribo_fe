import { PlanillaLlevarLavanderiaPage } from "@/lib/components/planillas/PlanillaLlevarLavanderiaPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Llevar a Lavandería",
};

export default function PlanillaLlevarPage() {
  return <PlanillaLlevarLavanderiaPage />;
}
