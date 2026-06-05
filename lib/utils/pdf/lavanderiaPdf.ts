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

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generarPdfLlevarLavanderia(
  tareas: TareaLavanderiaItem[],
  lavanderiaNombre: string,
  fechaEnvio: string,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const logoBase64 = await loadImageAsBase64("/icon.png");

  let cursorY = 14;

  if (logoBase64) {
    // logo ancho 60mm, alto proporcional (imagen ~6:1 aprox) → ~10mm alto
    doc.addImage(logoBase64, "PNG", 14, cursorY, 60, 10);
    cursorY += 16;
  } else {
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("El Estribo", 14, cursorY + 6);
    doc.setFont("helvetica", "normal");
    cursorY += 14;
  }

  doc.setFontSize(16);
  doc.text("Planilla Envío Lavandería", 14, cursorY);
  cursorY += 9;

  doc.setFontSize(11);
  doc.text(`Lavandería: ${lavanderiaNombre}`, 14, cursorY);
  cursorY += 7;
  doc.text(`Fecha: ${formatApiDateForUi(fechaEnvio)}`, 14, cursorY);
  cursorY += 7;
  doc.text(`Cantidad de prendas: ${tareas.length}`, 14, cursorY);
  cursorY += 7;

  autoTable(doc, {
    startY: cursorY,
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
