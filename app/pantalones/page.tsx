"use client";

import { PrendaCrudPage } from "@/lib/components/catalogos/PrendaCrudPage";
import {
    actualizarPantalon,
    crearPantalon,
    eliminarPantalon,
    listarPantalones,
} from "@/lib/services/v2";

export default function PantalonesPage() {
  return (
    <PrendaCrudPage
      title="Pantalones"
      entitySingular="pantalón"
      listFn={listarPantalones}
      createFn={crearPantalon}
      updateFn={actualizarPantalon}
      deleteFn={eliminarPantalon}
    />
  );
}
