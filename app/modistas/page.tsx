"use client";

import { ContactoCrudPage } from "@/lib/components/catalogos/ContactoCrudPage";
import { Modista } from "@/lib/domain/reservas/types";
import {
  actualizarModista,
  crearModista,
  eliminarModista,
  listarModistas,
  setModistaPredeterminada,
} from "@/lib/services/v2";

export default function ModistasPage() {
  return (
    <ContactoCrudPage<Modista>
      title="Modistas"
      entityLabel="modista"
      deleteConfirmMessage={(row) =>
        `¿Seguro que querés eliminar la modista "${row.nombre}"?`
      }
      listFn={listarModistas}
      createFn={crearModista}
      updateFn={actualizarModista}
      deleteFn={eliminarModista}
      setDefaultFn={setModistaPredeterminada}
    />
  );
}
