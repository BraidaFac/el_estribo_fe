"use client";

import { PrendaCrudPage } from "@/lib/components/catalogos/PrendaCrudPage";
import {
    actualizarSaco,
    crearSaco,
    eliminarSaco,
    listarSacos,
} from "@/lib/services/v2";

export default function SacosPage() {
  return (
    <PrendaCrudPage
      title="Sacos"
      entitySingular="saco"
      listFn={listarSacos}
      createFn={crearSaco}
      updateFn={actualizarSaco}
      deleteFn={eliminarSaco}
    />
  );
}
