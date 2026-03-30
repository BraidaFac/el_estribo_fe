"use client";

import { MedicionesReservaModal } from "@/lib/components/medidas/MedicionesReservaModal";
import {
  getEstadoTareaOperativaLabel,
  getPrioridadTareaOperativaLabel,
} from "@/lib/domain/reservas/labels";
import { TareaOperativa } from "@/lib/domain/reservas/types";
import { buildWhatsappContactoMedicionMessage } from "@/lib/domain/reservas/whatsappContactoMedicion";
import {
  listarAgendaMediciones,
  listarTareasOperativas,
  marcarContactoMedicion,
  programarMedicion,
} from "@/lib/services/v2";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { formatApiDateForUi } from "@/lib/utils/formatApiDate";
import { TABLE_HEADER_CLASS } from "@/lib/utils/uiStyles";
import {
  Button,
  Checkbox,
  DatePicker,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  TimeInput,
} from "@heroui/react";
import { Time, parseDate } from "@internationalized/date";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return null;
  return digits.startsWith("54") ? digits : `54${digits}`;
}

function WhatsappIconLink({
  telefono,
  mensaje,
}: {
  telefono: string | null | undefined;
  mensaje: string;
}) {
  const n = normalizePhone(telefono);
  if (!n) return null;
  const text = encodeURIComponent(mensaje);
  return (
    <a
      href={`https://wa.me/${n}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 rounded-md p-1.5 text-[#25D366] hover:bg-emerald-50"
      aria-label="Abrir WhatsApp"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    </a>
  );
}

/** ID agenda desde metadata (JSON a veces devuelve number o string). */
function coerceAgendaId(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Tiene fila en agenda vinculada (cita programada o reagendada). */
function tieneCitaAgendada(t: TareaOperativa): boolean {
  return coerceAgendaId(t.metadataJson?.agendaMedicionId) != null;
}

function getFechaHoraCitaAgendadaMeta(
  meta: TareaOperativa["metadataJson"],
): string | null {
  if (!meta) return null;
  const v = meta.fechaHoraCitaAgendada;
  if (typeof v === "string" && v.trim() !== "") return v;
  return null;
}

function getObservacionesAgendaMeta(meta: TareaOperativa["metadataJson"]): string {
  if (!meta) return "";
  const v = meta.observacionesAgenda;
  if (v == null) return "";
  if (typeof v === "string") return v;
  return String(v);
}

/** Solo registro de contacto, sin cita todavía. */
function soloContactoSinCita(t: TareaOperativa): boolean {
  return Boolean(t.metadataJson?.yaHablado) && !tieneCitaAgendada(t);
}

/** Valor para input datetime-local desde ISO guardado en metadata. */
function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function estadoFilaLabel(row: TareaOperativa): string {
  if (tieneCitaAgendada(row)) return "Agendado";
  if (soloContactoSinCita(row)) return "Ya hablado";
  return getEstadoTareaOperativaLabel(row.estado);
}

function getRowClass(tarea: TareaOperativa): string {
  if (tieneCitaAgendada(tarea)) return "bg-emerald-50";
  if (soloContactoSinCita(tarea)) return "bg-amber-50/90";
  const dias = tarea.fechaObjetivoDesde
    ? differenceInCalendarDays(new Date(`${tarea.fechaObjetivoDesde}T00:00:00`), new Date())
    : 999;
  if (dias <= 3) return "bg-rose-50";
  return "";
}

function splitLocalDateTime(isoOrLocal: string): { date: string; time: string } {
  const local = toDatetimeLocalValue(isoOrLocal);
  if (!local) return { date: "", time: "" };
  const [date, rest] = local.split("T");
  const time = (rest ?? "").slice(0, 5);
  return { date: date ?? "", time };
}

function combineLocalDateTime(date: string, time: string): string {
  const t = time.length >= 5 ? time.slice(0, 5) : time;
  if (!date || !t) return "";
  return `${date}T${t}`;
}

const YMD = /^\d{4}-\d{2}-\d{2}$/;

function parseCitaDateValue(ymd: string) {
  if (!ymd || !YMD.test(ymd)) return null;
  try {
    return parseDate(ymd);
  } catch {
    return null;
  }
}

function parseCitaTimeValue(hm: string): Time | null {
  if (hm == null || hm.length < 4) return null;
  const [hs, ms] = hm.split(":");
  const h = Number.parseInt(hs ?? "", 10);
  const m = Number.parseInt(ms ?? "", 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return new Time(h, m);
}

function timeValueToHm(t: Time): string {
  return `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`;
}

export function PlanillaContactoMedicionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [tareas, setTareas] = useState<TareaOperativa[]>([]);
  const [selectedTask, setSelectedTask] = useState<TareaOperativa | null>(null);
  const [citaDate, setCitaDate] = useState("");
  const [citaTime, setCitaTime] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [noValidarFecha, setNoValidarFecha] = useState(false);
  const [isSavingAgenda, setIsSavingAgenda] = useState(false);
  const [markingContactId, setMarkingContactId] = useState<number | null>(null);
  const [isLoadingAgendaDetalle, setIsLoadingAgendaDetalle] = useState(false);
  const [medicionesCtx, setMedicionesCtx] = useState<{
    reservaId: number;
    tienePantalon: boolean;
  } | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await listarTareasOperativas({ tipoTarea: "CONTACTAR_MEDICION" });
      setTareas(data);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function inicializarModal() {
      if (!selectedTask) {
        setCitaDate("");
        setCitaTime("");
        setObservaciones("");
        setIsLoadingAgendaDetalle(false);
        return;
      }

      const obsMeta = getObservacionesAgendaMeta(selectedTask.metadataJson);
      const isoMeta = getFechaHoraCitaAgendadaMeta(selectedTask.metadataJson);

      if (isoMeta) {
        const { date, time } = splitLocalDateTime(isoMeta);
        if (!cancelled) {
          setCitaDate(date);
          setCitaTime(time);
          setObservaciones(obsMeta);
        }
        return;
      }

      const agendaId = coerceAgendaId(selectedTask.metadataJson?.agendaMedicionId);
      if (agendaId != null) {
        try {
          setIsLoadingAgendaDetalle(true);
          const desde = selectedTask.fechaObjetivoDesde
            ? format(addDays(parseISO(`${selectedTask.fechaObjetivoDesde}T12:00:00`), -21), "yyyy-MM-dd")
            : format(addDays(new Date(), -60), "yyyy-MM-dd");
          const hasta = selectedTask.fechaObjetivoHasta
            ? format(addDays(parseISO(`${selectedTask.fechaObjetivoHasta}T12:00:00`), 21), "yyyy-MM-dd")
            : format(addDays(new Date(), 60), "yyyy-MM-dd");
          const lista = await listarAgendaMediciones({
            desde,
            hasta,
            incluirTodosLosEstados: true,
          });
          const hit = lista.find((a) => a.id === agendaId);
          if (!cancelled && hit) {
            const { date, time } = splitLocalDateTime(hit.fechaHoraCita);
            setCitaDate(date);
            setCitaTime(time);
            setObservaciones(hit.observaciones?.trim() ? hit.observaciones : obsMeta);
            return;
          }
        } catch {
          // si falla el listado, dejamos campos vacíos salvo observaciones de metadata
        } finally {
          if (!cancelled) setIsLoadingAgendaDetalle(false);
        }
      }

      if (!cancelled) {
        setCitaDate("");
        setCitaTime("");
        setObservaciones(obsMeta);
      }
    }

    void inicializarModal();
    return () => {
      cancelled = true;
    };
  }, [selectedTask]);

  const citaDatePickerValue = useMemo(() => parseCitaDateValue(citaDate), [citaDate]);
  const citaTimeInputValue = useMemo(() => parseCitaTimeValue(citaTime), [citaTime]);

  const sorted = useMemo(() => {
    return [...tareas].sort((a, b) => {
      const diasA = a.fechaObjetivoDesde
        ? differenceInCalendarDays(new Date(`${a.fechaObjetivoDesde}T00:00:00`), new Date())
        : 999;
      const diasB = b.fechaObjetivoDesde
        ? differenceInCalendarDays(new Date(`${b.fechaObjetivoDesde}T00:00:00`), new Date())
        : 999;
      return diasA - diasB;
    });
  }, [tareas]);

  const handleMarcarContacto = async (tarea: TareaOperativa) => {
    try {
      setMarkingContactId(tarea.id);
      await marcarContactoMedicion(tarea.id);
      toast.success("Contacto con el cliente registrado");
      await load();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setMarkingContactId(null);
    }
  };

  const handleProgramar = async () => {
    if (!selectedTask) return;
    const fechaHoraCita = combineLocalDateTime(citaDate, citaTime);
    if (!fechaHoraCita) {
      toast.error("Selecciona fecha y hora de cita");
      return;
    }
    if (!noValidarFecha && selectedTask.fechaObjetivoDesde && selectedTask.fechaObjetivoHasta) {
      const citaKey = fechaHoraCita.slice(0, 10);
      if (
        citaKey < selectedTask.fechaObjetivoDesde ||
        citaKey > selectedTask.fechaObjetivoHasta
      ) {
        toast.error("La cita debe quedar dentro de la ventana de medición");
        return;
      }
    }
    const esReagendar = tieneCitaAgendada(selectedTask);
    try {
      setIsSavingAgenda(true);
      await programarMedicion(selectedTask.id, {
        fechaHoraCita,
        observaciones,
        noValidarFecha: noValidarFecha || undefined,
      });
      toast.success(esReagendar ? "Cita actualizada" : "Cita de medición programada");
      setSelectedTask(null);
      setCitaDate("");
      setCitaTime("");
      setObservaciones("");
      setNoValidarFecha(false);
      await load();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setIsSavingAgenda(false);
    }
  };

  const abrirModalAgenda = (row: TareaOperativa) => {
    setSelectedTask(row);
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">Contactar medición</h1>
        <p className="mt-1 text-sm text-pastel-text/80">
          Clientes a contactar para coordinar la toma de medidas dentro de la ventana indicada. El listado
          se actualiza al entrar.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-28 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : (
        <Table aria-label="Planilla de contacto de medicion">
          <TableHeader>
            <TableColumn className={TABLE_HEADER_CLASS}>Prioridad</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Cliente</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Teléfono</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Reserva</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Ventana medición</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Estado</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Acciones</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay tareas de contacto para mostrar">
            {sorted.map((row) => {
              const agendada = tieneCitaAgendada(row);
              const yaMarcadoContacto = Boolean(row.metadataJson?.yaHablado);
              return (
                <TableRow key={row.id} className={getRowClass(row)}>
                  <TableCell>{getPrioridadTareaOperativaLabel(row.prioridad)}</TableCell>
                  <TableCell>{row.clienteNombre ?? "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="min-w-0">{row.clienteTelefono ?? "—"}</span>
                      <WhatsappIconLink
                        telefono={row.clienteTelefono}
                        mensaje={buildWhatsappContactoMedicionMessage(row)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>#{row.reserva?.id ?? "-"}</TableCell>
                  <TableCell>{`${formatApiDateForUi(row.fechaObjetivoDesde ?? "")} a ${formatApiDateForUi(row.fechaObjetivoHasta ?? "")}`}</TableCell>
                  <TableCell>{estadoFilaLabel(row)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="bordered"
                        isDisabled={yaMarcadoContacto || markingContactId === row.id}
                        isLoading={markingContactId === row.id}
                        onPress={() => handleMarcarContacto(row)}
                      >
                        Registrar contacto
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => abrirModalAgenda(row)}
                      >
                        {agendada ? "Re agendar" : "Agendar"}
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="bordered"
                        aria-label="Registrar mediciones"
                        isDisabled={!row.reserva?.id}
                        onPress={() =>
                          row.reserva?.id &&
                          setMedicionesCtx({
                            reservaId: row.reserva.id,
                            tienePantalon: Boolean(row.reserva.pantalon),
                          })
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={20}
                          height={20}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.75}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M15 3v18M9 3v18M3 9h18M3 15h18" />
                          <path d="M3 9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={!!selectedTask}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTask(null);
            setNoValidarFecha(false);
          }
        }}
      >
        <ModalContent>
          <>
            <ModalHeader>
              {selectedTask && tieneCitaAgendada(selectedTask)
                ? `Reagendar medición — Tarea #${selectedTask.id}`
                : `Programar medición${selectedTask ? ` — Tarea #${selectedTask.id}` : ""}`}
            </ModalHeader>
            <ModalBody>
              {isLoadingAgendaDetalle ? (
                <div className="flex justify-center py-6">
                  <Spinner size="sm" color="secondary" />
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-pastel-text">Fecha y hora</p>
                  <div className="mt-2 grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                    <DatePicker
                      key={`cita-date-${selectedTask?.id ?? 0}`}
                      label="Fecha"
                      labelPlacement="outside"
                      size="md"
                      granularity="day"
                      value={citaDatePickerValue}
                      onChange={(v) => setCitaDate(v == null ? "" : v.toString())}
                      popoverProps={{
                        shouldCloseOnScroll: false,
                        classNames: { content: "z-[10050]" },
                      }}
                    />
                    <TimeInput
                      key={`cita-time-${selectedTask?.id ?? 0}`}
                      label="Hora"
                      labelPlacement="outside"
                      size="md"
                      granularity="minute"
                      hourCycle={24}
                      value={citaTimeInputValue}
                      onChange={(v) => setCitaTime(v == null ? "" : timeValueToHm(v))}
                    />
                  </div>
                  <Checkbox
                    className="mt-3"
                    isSelected={noValidarFecha}
                    onValueChange={setNoValidarFecha}
                  >
                    No validar fecha
                  </Checkbox>
                  <p className="mt-1 text-xs text-pastel-text/70">
                    Si está marcado, no se comprueba que la cita esté dentro de la ventana de medición
                    (solo con excepción operativa).
                  </p>
                  <Textarea
                    className="mt-2"
                    label="Observaciones"
                    labelPlacement="outside"
                    value={observaciones}
                    onValueChange={setObservaciones}
                  />
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={() => {
                  setSelectedTask(null);
                  setNoValidarFecha(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleProgramar}
                isLoading={isSavingAgenda}
                isDisabled={isLoadingAgendaDetalle}
              >
                {selectedTask && tieneCitaAgendada(selectedTask)
                  ? "Guardar cambios"
                  : "Guardar cita"}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      <MedicionesReservaModal
        isOpen={medicionesCtx != null}
        onOpenChange={(open) => {
          if (!open) setMedicionesCtx(null);
        }}
        reservaId={medicionesCtx?.reservaId ?? null}
        tienePantalon={medicionesCtx?.tienePantalon ?? false}
        onGuardado={() => void load()}
      />
    </div>
  );
}
