"use client";

import { ContactoCrudPage } from "@/lib/components/catalogos/ContactoCrudPage";
import { Lavanderia } from "@/lib/domain/reservas/types";
import {
  actualizarLavanderia,
  crearLavanderia,
  eliminarLavanderia,
  listarLavanderias,
  setLavanderiaPredeterminada,
} from "@/lib/services/v2";

export default function LavanderiasPage() {
  return (
    <ContactoCrudPage<Lavanderia>
      title="Lavanderias"
      entityLabel="lavanderia"
      deleteConfirmMessage={(row) =>
        `¿Seguro que querés eliminar la lavandería "${row.nombre}"?`
      }
      listFn={listarLavanderias}
      createFn={crearLavanderia}
      updateFn={actualizarLavanderia}
      deleteFn={eliminarLavanderia}
      setDefaultFn={setLavanderiaPredeterminada}
    />
  );
}
