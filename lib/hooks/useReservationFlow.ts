"use client";

import { CreateReservaV2Payload, Pantalon } from "@/lib/domain/reservas/types";
import { ApiError } from "@/lib/services/http";
import {
  crearReservaV2,
  pantalonesDisponibles,
  validarReservaV2,
} from "@/lib/services/v2";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

type ReservationFormState = {
  clienteDni: string;
  clienteNombre: string;
  nombreCuenta: string;
  clienteTelefono: string;
  observaciones: string;
  pantalonId?: number;
};

type ReservationFieldErrors = Partial<Record<keyof ReservationFormState, string>>;

const INITIAL_FORM: ReservationFormState = {
  clienteDni: "",
  clienteNombre: "",
  nombreCuenta: "",
  clienteTelefono: "",
  observaciones: "",
  pantalonId: undefined,
};

type UseReservationFlowArgs = {
  isOpen: boolean;
  sacoId: number | null;
  fechaReserva: string | null;
};

export function useReservationFlow({
  isOpen,
  sacoId,
  fechaReserva,
}: UseReservationFlowArgs) {
  const [form, setForm] = useState<ReservationFormState>(INITIAL_FORM);
  const [pantalones, setPantalones] = useState<Pantalon[]>([]);

  const [isBootstrapLoading, setIsBootstrapLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [validacionFechaError, setValidacionFechaError] = useState<string | null>(null);
  const [ofertaUltimoMomento, setOfertaUltimoMomento] = useState(false);
  const [reservaUltimoMomento, setReservaUltimoMomento] = useState(false);
  const [isValidandoFecha, setIsValidandoFecha] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReservationFieldErrors>({});
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  const canSubmit = useMemo(() => {
    const todayKey = format(new Date(), "yyyy-MM-dd");
    const isPastDate = !!fechaReserva && fechaReserva < todayKey;
    return (
      !!sacoId &&
      !!fechaReserva &&
      !isPastDate &&
      !!form.clienteDni.trim() &&
      !!form.clienteNombre.trim() &&
      Object.keys(fieldErrors).length === 0 &&
      !isSubmitting &&
      !isValidandoFecha &&
      !validacionFechaError
    );
  }, [
    fechaReserva,
    fieldErrors,
    form.clienteDni,
    form.clienteNombre,
    isSubmitting,
    isValidandoFecha,
    sacoId,
    validacionFechaError,
  ]);

  const reset = useCallback(() => {
    setForm(INITIAL_FORM);
    setPantalones([]);
    setLoadError(null);
    setValidacionFechaError(null);
    setOfertaUltimoMomento(false);
    setReservaUltimoMomento(false);
    setIsValidandoFecha(false);
    setFieldErrors({});
    setHasTriedSubmit(false);
    setIsSubmitting(false);
    setIsBootstrapLoading(false);
  }, []);

  const loadBootstrapData = useCallback(async () => {
    if (!isOpen || !fechaReserva) return;

    setIsBootstrapLoading(true);
    setLoadError(null);
    try {
      const pantalonesDisponiblesData = await pantalonesDisponibles(fechaReserva);
      setPantalones(pantalonesDisponiblesData);
    } catch (error) {
      setLoadError(getUserFacingErrorMessage(error));
    } finally {
      setIsBootstrapLoading(false);
    }
  }, [fechaReserva, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    loadBootstrapData();
  }, [isOpen, loadBootstrapData]);

  useEffect(() => {
    if (!isOpen) return;
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setHasTriedSubmit(false);
    setOfertaUltimoMomento(false);
    setReservaUltimoMomento(false);
  }, [isOpen, fechaReserva, sacoId]);

  useEffect(() => {
    if (!isOpen || !sacoId || !fechaReserva) {
      setValidacionFechaError(null);
      setIsValidandoFecha(false);
      return;
    }
    const todayKey = format(new Date(), "yyyy-MM-dd");
    if (fechaReserva < todayKey) {
      setValidacionFechaError(
        "No se pueden crear reservas en fechas anteriores al dia de hoy",
      );
      setIsValidandoFecha(false);
      return;
    }

    let cancelled = false;
    setIsValidandoFecha(true);
    setValidacionFechaError(null);
    void (async () => {
      try {
        await validarReservaV2({
          sacoId,
          pantalonId: form.pantalonId,
          fechaReserva,
          requiereModista: true,
          ...(reservaUltimoMomento ? { reservaUltimoMomento: true } : {}),
        });
        if (!cancelled) {
          setValidacionFechaError(null);
          setOfertaUltimoMomento(false);
        }
      } catch (error) {
        if (!cancelled) {
          setValidacionFechaError(getUserFacingErrorMessage(error));
          const payload =
            error instanceof ApiError && error.payload && typeof error.payload === "object"
              ? (error.payload as Record<string, unknown>)
              : null;
          setOfertaUltimoMomento(payload?.puedeUltimoMomento === true);
        }
      } finally {
        if (!cancelled) {
          setIsValidandoFecha(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, sacoId, fechaReserva, form.pantalonId, reservaUltimoMomento]);

  const validateForm = useCallback((): ReservationFieldErrors => {
    const errors: ReservationFieldErrors = {};

    if (!form.clienteDni.trim()) {
      errors.clienteDni = "El DNI es obligatorio";
    } else if (!/^[0-9]{6,15}$/.test(form.clienteDni.trim())) {
      errors.clienteDni = "El DNI debe contener solo numeros (6 a 15 digitos)";
    }

    if (!form.clienteNombre.trim()) {
      errors.clienteNombre = "El nombre es obligatorio";
    } else if (form.clienteNombre.trim().length < 2) {
      errors.clienteNombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (form.clienteTelefono.trim() && !/^[0-9+\-\s()]{6,20}$/.test(form.clienteTelefono.trim())) {
      errors.clienteTelefono = "Ingresa un telefono valido";
    }

    if (form.pantalonId && !pantalones.some((p) => p.id === form.pantalonId)) {
      errors.pantalonId = "El pantalon seleccionado ya no esta disponible";
    }

    return errors;
  }, [form, pantalones]);

  useEffect(() => {
    if (!hasTriedSubmit) return;
    setFieldErrors(validateForm());
  }, [form, pantalones, hasTriedSubmit, validateForm]);

  const submit = useCallback(async () => {
    if (!sacoId || !fechaReserva) {
      throw new Error("No hay saco o fecha seleccionada");
    }
    const todayKey = format(new Date(), "yyyy-MM-dd");
    if (fechaReserva < todayKey) {
      throw new Error("No se pueden crear reservas en fechas anteriores al dia de hoy");
    }

    const errors = validateForm();
    setHasTriedSubmit(true);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      throw new Error("Revisa los campos marcados antes de confirmar");
    }

    setIsSubmitting(true);
    try {
      const validarPayload = {
        sacoId,
        pantalonId: form.pantalonId,
        fechaReserva,
        requiereModista: true,
        ...(reservaUltimoMomento ? { reservaUltimoMomento: true } : {}),
      };

      await validarReservaV2(validarPayload);

      const payload: CreateReservaV2Payload = {
        ...validarPayload,
        clienteDni: form.clienteDni.trim(),
        clienteNombre: form.clienteNombre.trim(),
        nombreCuenta: form.nombreCuenta.trim() || undefined,
        clienteTelefono: form.clienteTelefono.trim() || undefined,
        observaciones: form.observaciones.trim() || undefined,
      };

      const reserva = await crearReservaV2(payload);
      return reserva;
    } catch (error) {
      throw new Error(getUserFacingErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [fechaReserva, form, reservaUltimoMomento, sacoId, validateForm]);

  return {
    form,
    setForm,
    pantalones,
    isBootstrapLoading,
    isSubmitting,
    loadError,
    validacionFechaError,
    ofertaUltimoMomento,
    reservaUltimoMomento,
    setReservaUltimoMomento,
    isValidandoFecha,
    fieldErrors,
    canSubmit,
    loadBootstrapData,
    submit,
    reset,
  };
}
