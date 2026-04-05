export type AccesorioItem = {
  id: number;
  nombre: string;
  icono: string;
};

export type CreateAccesorioPayload = {
  nombre: string;
  icono: string;
};

export type UpdateAccesorioPayload = {
  nombre?: string;
  icono?: string;
};

export type ReservaExtraItem = {
  id: number;
  accesorio: AccesorioItem;
  observacion: string | null;
  devuelto: boolean | null;
  observacionDevolucion: string | null;
};

export type SetReservaExtrasPayload = {
  extras: { accesorioId: number; observacion?: string | null }[];
};

export type PatchDevolucionExtrasPayload = {
  extras: {
    extraId: number;
    devuelto: boolean;
    observacionDevolucion?: string | null;
  }[];
};
