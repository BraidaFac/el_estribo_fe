"use client";

import { BlockDetailPopover } from "@/lib/components/bloqueos/BlockDetailPopover";
import { MedicionesReservaModal } from "@/lib/components/medidas/MedicionesReservaModal";
import { SacoCalendar } from "@/lib/components/calendar/SacoCalendar";
import { SacoFilterInput } from "@/lib/components/calendar/SacoFilterInput";
import { ReservationActionsDialog } from "@/lib/components/reservas/ReservationActionsDialog";
import { ReservationModal } from "@/lib/components/reservas/ReservationModal";
import { getBloqueoLabel } from "@/lib/domain/calendar/calendar-utils";
import { CalendarDayModel } from "@/lib/domain/calendar/calendar-utils";
import { getEstadoUbicacionPrendaLabel } from "@/lib/domain/reservas/labels";
import { BloqueoPrenda, Reserva, Saco } from "@/lib/domain/reservas/types";
import { listarBloqueosPorPrenda, listarReservasRango } from "@/lib/services/v2";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { formatApiDateForUi, formatApiDateTimeForUi } from "@/lib/utils/formatApiDate";
import { useDisclosure } from "@heroui/react";
import { addMonths, format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function CalendarioV2Screen() {
  const {
    isOpen: isReservationOpen,
    onOpen: onOpenReservation,
    onOpenChange: onReservationOpenChange,
  } = useDisclosure();
  const {
    isOpen: isBlocksOpen,
    onOpen: onOpenBlocks,
    onOpenChange: onBlocksOpenChange,
  } = useDisclosure();
  const {
    isOpen: isReservationActionsOpen,
    onOpen: onOpenReservationActions,
    onOpenChange: onReservationActionsOpenChange,
  } = useDisclosure();
  const {
    isOpen: isMedicionesOpen,
    onOpen: onMedicionesOpen,
    onClose: onMedicionesClose,
  } = useDisclosure();
  const [selectedSacoId, setSelectedSacoId] = useState<number | null>(null);
  const [selectedSaco, setSelectedSaco] = useState<Saco | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBlockedDate, setSelectedBlockedDate] = useState<string | null>(null);
  const [selectedDayReservations, setSelectedDayReservations] = useState<Reserva[]>(
    [],
  );
  const [selectedDayBlocks, setSelectedDayBlocks] = useState<
    CalendarDayModel["bloqueosDelDia"]
  >([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [nextBloqueo, setNextBloqueo] = useState<BloqueoPrenda | null>(null);
  const [medicionesCalendario, setMedicionesCalendario] = useState<{
    reservaId: number;
    tienePantalon: boolean;
  } | null>(null);

  useEffect(() => {
    if (!selectedSacoId) {
      setNextBloqueo(null);
      return;
    }
    (async () => {
      try {
        const desde = format(new Date(), "yyyy-MM-dd");
        const hasta = format(addMonths(new Date(), 6), "yyyy-MM-dd");
        const bloqueos = await listarBloqueosPorPrenda("SACO", selectedSacoId, desde, hasta);
        const proximo = bloqueos
          .filter((bloqueo) => bloqueo.estado === "ACTIVO" && bloqueo.fin >= desde)
          .sort((a, b) =>
            a.inicio === b.inicio ? a.id - b.id : a.inicio.localeCompare(b.inicio),
          )[0];
        setNextBloqueo(proximo ?? null);
      } catch (error) {
        setNextBloqueo(null);
        toast.error(getUserFacingErrorMessage(error));
      }
    })();
  }, [refreshKey, selectedSacoId]);

  const handleAvailableDay = (model: CalendarDayModel) => {
    setSelectedDate(model.dayKey);
    onOpenReservation();
  };

  const handleBlockedDay = async (model: CalendarDayModel) => {
    try {
      if (selectedSacoId) {
        const reservasDelDia = await listarReservasRango(
          model.dayKey,
          model.dayKey,
          selectedSacoId,
        );

        const medicionActivos = model.bloqueosActivosDelDia
          .filter((b) => b.tipoBloqueo === "MEDICION")
          .sort((a, b) => a.id - b.id);
        const bloqueoMedicion = medicionActivos.find(
          (b) => b.reserva?.id != null,
        );
        const reservaIdDesdeBloqueo = bloqueoMedicion?.reserva?.id ?? null;
        const esMedicion = medicionActivos.length > 0;

        /** Fase 3: la reserva de medición viene del bloqueo MEDICIÓN, no del primer resultado del rango. */
        if (esMedicion && reservaIdDesdeBloqueo != null) {
          const rMatch = reservasDelDia.find((r) => r.id === reservaIdDesdeBloqueo);
          const tienePantalon = rMatch
            ? rMatch.pantalon != null
            : Boolean(bloqueoMedicion?.reserva?.pantalon);
          setMedicionesCalendario({
            reservaId: reservaIdDesdeBloqueo,
            tienePantalon,
          });
          onMedicionesOpen();
          return;
        }

        if (esMedicion && reservasDelDia.length > 0) {
          const r = reservasDelDia[0];
          setMedicionesCalendario({
            reservaId: r.id,
            tienePantalon: r.pantalon != null,
          });
          onMedicionesOpen();
          return;
        }

        if (reservasDelDia.length > 0) {
          setSelectedBlockedDate(model.dayKey);
          setSelectedDayReservations(reservasDelDia);
          onOpenReservationActions();
          return;
        }
      }

      setSelectedBlockedDate(model.dayKey);
      setSelectedDayBlocks(model.bloqueosDelDia);
      onOpenBlocks();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    }
  };

  const handleNonWorkingDay = (model: CalendarDayModel) => {
    toast("Dia no laborable", {
      description: model.isHoliday
        ? `${model.dayKey} es feriado. No se pueden crear reservas ese dia.`
        : `${model.dayKey} es domingo. No se pueden crear reservas ese dia.`,
    });
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">Calendario</h1>
        
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SacoFilterInput
            value={selectedSacoId}
            onSelect={(sacoId) => setSelectedSacoId(sacoId)}
            onSelectedSacoChange={setSelectedSaco}
          />
          <div className="rounded-lg border border-pastel-border bg-pastel-soft p-3 text-sm text-pastel-text">
            {!selectedSaco ? (
              <p>Selecciona un saco para ver su estado y próximo evento.</p>
            ) : (
              <div className="space-y-1">
                <p>
                  <strong>Saco:</strong> {selectedSaco.codigo} - {selectedSaco.marca}
                  {selectedSaco.color?.trim()
                    ? ` - ${selectedSaco.color.trim()}`
                    : ""}
                </p>
                <p>
                  <strong>Estado actual:</strong>{" "}
                  {getEstadoUbicacionPrendaLabel(selectedSaco.ubicacionActual)}
                </p>
                <p>
                  <strong>Proximo evento:</strong>{" "}
                  {nextBloqueo
                    ? `${getBloqueoLabel(nextBloqueo.tipoBloqueo)} (${formatApiDateTimeForUi(nextBloqueo.inicio)})`
                    : "Sin bloqueos proximos"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <SacoCalendar
        sacoId={selectedSacoId}
        refreshKey={refreshKey}
        onSelectAvailableDay={handleAvailableDay}
        onSelectBlockedDay={handleBlockedDay}
        onSelectNonWorkingDay={handleNonWorkingDay}
      />
      <ReservationModal
        isOpen={isReservationOpen}
        onOpenChange={onReservationOpenChange}
        sacoId={selectedSacoId}
        fechaReserva={selectedDate}
        onReservationCreated={() => {
          setRefreshKey((prev) => prev + 1);
        }}
      />
      <BlockDetailPopover
        isOpen={isBlocksOpen}
        onOpenChange={onBlocksOpenChange}
        dayKey={selectedBlockedDate}
        bloqueos={selectedDayBlocks}
        onAfterCancel={() => {
          setRefreshKey((prev) => prev + 1);
        }}
      />
      <MedicionesReservaModal
        isOpen={isMedicionesOpen}
        onOpenChange={(open) => {
          if (!open) {
            setMedicionesCalendario(null);
            onMedicionesClose();
          }
        }}
        reservaId={medicionesCalendario?.reservaId ?? null}
        tienePantalon={medicionesCalendario?.tienePantalon ?? false}
        onGuardado={() => setRefreshKey((k) => k + 1)}
      />
      <ReservationActionsDialog
        isOpen={isReservationActionsOpen}
        onOpenChange={onReservationActionsOpenChange}
        title={`Reservas del día ${selectedBlockedDate ? formatApiDateForUi(selectedBlockedDate) : ""}`}
        reservas={selectedDayReservations}
        onDataChanged={async () => {
          setRefreshKey((prev) => prev + 1);
          if (selectedSacoId && selectedBlockedDate) {
            const reservasActualizadas = await listarReservasRango(
              selectedBlockedDate,
              selectedBlockedDate,
              selectedSacoId,
            );
            setSelectedDayReservations(reservasActualizadas);
          }
        }}
      />
    </div>
  );
}
