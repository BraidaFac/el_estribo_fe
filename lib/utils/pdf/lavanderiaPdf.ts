import { TareaLavanderiaItem } from "@/lib/domain/reservas/types";
import { formatApiDateForUi } from "@/lib/utils/formatApiDate";
import { subDays } from "date-fns";

const PRIORIDAD_LABEL: Record<string, string> = {
  ALTA: "Alta",
  MEDIA: "Media",
  BAJA: "Baja",
};

const DECISION_LABEL: Record<string, string> = {
  LAVANDERIA_EXTERNA: "Lav. externa",
  LIMPIEZA_LOCAL: "Limpieza local",
};

const PRENDA_LABEL: Record<string, string> = {
  SACO: "Saco",
  PANTALON: "Pantalón",
};

function fechaSugeridaEntrega(proximaReservaFecha: string | null): string {
  if (!proximaReservaFecha) return "-";
  return formatApiDateForUi(
    subDays(new Date(`${proximaReservaFecha}`), 7)
      .toISOString()
      .slice(0, 10),
  );
}

export async function generarPdfLlevarLavanderia(
  tareas: TareaLavanderiaItem[],
  lavanderiaNombre: string,
  fechaEnvio: string,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.setFontSize(16);
  doc.text("Planilla Envío Lavandería", 14, 18);

  doc.setFontSize(11);
  doc.text(`Lavandería: ${lavanderiaNombre}`, 14, 27);
  doc.text(`Fecha: ${formatApiDateForUi(fechaEnvio)}`, 14, 34);
  doc.text(`Cantidad de prendas: ${tareas.length}`, 14, 41);

  autoTable(doc, {
    startY: 48,
    head: [
      [
        "Tipo",
        "Código",
        "Recomendación",
        "Próx. Reserva",
        "F. Sug. Entrega",
        "Prioridad",
      ],
    ],
    body: tareas.map((t) => [
      t.tipoPrenda ? (PRENDA_LABEL[t.tipoPrenda] ?? t.tipoPrenda) : "-",
      t.codigoPrenda ?? "-",
      t.decisionLavado
        ? (DECISION_LABEL[t.decisionLavado] ?? t.decisionLavado)
        : "-",
      formatApiDateForUi(t.proximaReservaFecha),
      fechaSugeridaEntrega(t.proximaReservaFecha),
      PRIORIDAD_LABEL[t.prioridad] ?? t.prioridad,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [40, 40, 80] },
    alternateRowStyles: { fillColor: [245, 245, 250] },
  });

  const nombreSanitizado = lavanderiaNombre.replace(
    /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g,
    "_",
  );
  doc.save(
    `lavanderia_${nombreSanitizado}_${fechaEnvio.replace(/-/g, "")}.pdf`,
  );
}
