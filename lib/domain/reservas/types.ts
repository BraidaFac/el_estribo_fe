export type TipoPrenda = "SACO" | "PANTALON";


export type CondicionPrenda = "LIMPIA" | "SUCIA" | "REQUIERE_REVISION";

export type EstadoReserva =
  | "CONFIRMADA"
  | "LISTO_PARA_ENTREGAR"
  | "EN_CURSO"
  | "COMPLETADA"
  | "CANCELADA";

export type EstadoControlPreEntrega = "APROBADO" | "RECHAZADO" | "RESUELTO";

export type EstadoUbicacionPrenda =
  | "TIENDA"
  | "EN_MODISTA"
  | "EN_LAVANDERIA"
  | "RETIRADO_CLIENTE";

export type TipoBloqueo =
  | "MEDICION"
  | "RESERVA"
  | "MODISTA"
  | "LISTO_TIENDA"
  | "LAVANDERIA"
  | "MANTENIMIENTO"
  | "MANUAL";

export type OrigenBloqueo = "AUTOMATICO" | "MANUAL";

export type EstadoBloqueo = "ACTIVO" | "CANCELADO";

export type TipoTareaOperativa =
  | "LLEVAR_LAVANDERIA"
  | "LLEVAR_MODISTA"
  | "CONTACTAR_MEDICION";
export type EstadoTareaOperativa =
  | "PENDIENTE"
  | "EN_PROCESO"
  | "COMPLETADA"
  | "CANCELADA";
export type PrioridadTareaOperativa = "ALTA" | "MEDIA" | "BAJA";
export type EstadoAgendaMedicion =
  | "PROGRAMADA"
  | "ASISTIO"
  | "NO_ASISTIO"
  | "REPROGRAMADA"
  | "CANCELADA";

export interface Saco {
  id: number;
  codigo: string;
  marca: string;
  talle: string | null;
  color: string | null;
  condicion: CondicionPrenda;
  activo: boolean;
  ubicacionActual: EstadoUbicacionPrenda;
  /** ISO 8601 desde el API (TypeORM created_at). */
  createdAt?: string;
}

export interface Pantalon {
  id: number;
  codigo: string;
  marca: string;
  talle: string | null;
  color: string | null;
  condicion: CondicionPrenda;
  activo: boolean;
  ubicacionActual: EstadoUbicacionPrenda;
  /** ISO 8601 desde el API (TypeORM created_at). */
  createdAt?: string;
}

export interface PrecioHistoricoLavanderia {
  id: number;
  precio: number;
  vigenciaDesde: string;
  createdAt: string;
}

export interface Lavanderia {
  id: number;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  predeterminada: boolean;
  activo: boolean;
  precioActual: number | null;
}

export interface Modista {
  id: number;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  predeterminada: boolean;
  activo: boolean;
}

/** Asignación operativa de lavandería/modista por reserva y tipo de prenda. */
export interface AsignacionServicioReserva {
  id: number;
  tipoPrenda: TipoPrenda;
  lavanderia: Lavanderia | null;
  modista: Modista | null;
}

export interface Reserva {
  id: number;
  /** Alta de la reserva (API puede incluirlo en listados). */
  createdAt?: string;
  fechaReserva: string;
  estadoReserva: EstadoReserva;
  saco: Saco;
  pantalon: Pantalon | null;
  /** Lavandería/modista por SACO y PANTALON (no a nivel de reserva única). */
  asignacionesServicio?: AsignacionServicioReserva[];
  clienteDni: string;
  clienteNombre: string;
  nombreCuenta: string | null;
  clienteTelefono: string | null;
  observaciones: string | null;
  requiereModista: boolean;
  diasModistaAplicados: number;
  diasLavanderiaAplicados: number;
  diasTomarMedicionesAplicados: number;
  clienteRetiroAt: string | null;
  clienteDevolvioAt: string | null;
  accionesPermitidas?: {
    editar: { permitida: boolean; motivo: string | null };
    cancelar: { permitida: boolean; motivo: string | null };
    retirar: { permitida: boolean; motivo: string | null };
    devolver: { permitida: boolean; motivo: string | null };
  };
}

export interface BloqueoPrenda {
  id: number;
  tipoPrenda: TipoPrenda;
  saco: Saco | null;
  pantalon: Pantalon | null;
  reserva: Reserva | null;
  lavanderia: Lavanderia | null;
  modista: Modista | null;
  tipoBloqueo: TipoBloqueo;
  origen: OrigenBloqueo;
  estado: EstadoBloqueo;
  inicio: string;
  fin: string;
  cancelableManual: boolean;
  motivo: string | null;
  creadoPor: string | null;
  canceladoPor: string | null;
  canceladoAt: string | null;
  motivoCancelacion: string | null;
}

export interface DiaNoLaborable {
  fecha: string;
  tipo: "DOMINGO" | "FERIADO";
  descripcion?: string | null;
}

export interface Disponibilidad {
  disponible: boolean;
  bloqueos: number;
}

export type PantalonesDisponibles = Pantalon[];

export interface ValidarReservaV2Payload {
  sacoId: number;
  pantalonId?: number;
  fechaReserva: string;
  requiereModista?: boolean;
  /** Solo tiene efecto si el backend indicó que aplica “último momento”. */
  reservaUltimoMomento?: boolean;
}

export interface CreateReservaV2Payload extends ValidarReservaV2Payload {
  clienteDni: string;
  clienteNombre: string;
  nombreCuenta?: string;
  clienteTelefono?: string;
  observaciones?: string;
}

export interface UpdateReservaV2Payload {
  clienteDni?: string;
  clienteNombre?: string;
  nombreCuenta?: string;
  clienteTelefono?: string;
  observaciones?: string;
}

export interface TareaLavanderiaItem {
  id: number;
  tipoPrenda: TipoPrenda | null;
  codigoPrenda: string | null;
  reservaId: number | null;
  clienteNombre: string | null;
  decisionLavado: "LAVANDERIA_EXTERNA" | "LIMPIEZA_LOCAL" | null;
  proximaReservaFecha: string | null;
  prioridad: PrioridadTareaOperativa;
  lavanderiaId: number | null;
  lavanderiaNombre: string | null;
  fechaIngresoLavanderia: string | null;
  fechaRetiroLavanderia: string | null;
  estado: EstadoTareaOperativa;
}

export interface TareaOperativa {
  id: number;
  tipoTarea: TipoTareaOperativa;
  estado: EstadoTareaOperativa;
  prioridad: PrioridadTareaOperativa;
  tipoPrenda: TipoPrenda | null;
  reserva: Reserva | null;
  saco: Saco | null;
  pantalon: Pantalon | null;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  fechaObjetivoDesde: string | null;
  fechaObjetivoHasta: string | null;
  metadataJson: Record<string, unknown> | null;
}

export interface AgendaMedicion {
  id: number;
  reserva: Reserva;
  tareaOperativa: TareaOperativa | null;
  clienteNombreSnapshot: string;
  clienteTelefonoSnapshot: string;
  fechaHoraCita: string;
  estado: EstadoAgendaMedicion;
  observaciones: string | null;
}

/** Medidas en cm; todo nullable. Forma del JSON persistido en backend. */
export interface MedidasSaco {
  pecho: number | null;
  hombros: number | null;
  largoSaco: number | null;
  largoManga: number | null;
  cintura: number | null;
  espalda: number | null;
}

export interface MedidasPantalon {
  cintura: number | null;
  cadera: number | null;
  largoPiernaInterno: number | null;
  largoTotal: number | null;
  tiro: number | null;
  musloYPierna: number | null;
  bota: number | null;
}

export interface MedicionesReservaJson {
  saco: MedidasSaco;
  pantalon: MedidasPantalon;
}

export interface MedicionesReservaResponse {
  reservaId: number;
  mediciones: MedicionesReservaJson;
  actualizadoEn: string | null;
  creadoPor: { id: string; name: string } | null;
  observacionSaco: string | null;
  observacionPantalon: string | null;
  observacionGeneral: string | null;
  sinModista: boolean;
}

export interface CancelarBloqueoPayload {
  motivoCancelacion: string;
  usuarioId?: string;
}

export interface ConfiguracionGeneral {
  id: number;
  diasLavanderia: number;
  diasModista: number;
  diasTomarMediciones: number;
  cantidadDiasPermitidoRetiro: number;
  dashboardDiasProximasReservas: number;
}
