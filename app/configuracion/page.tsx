"use client";

import {
  actualizarConfiguracionGeneral,
  obtenerConfiguracionGeneral,
} from "@/lib/services/v2";
import { Button, Input, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type FormState = {
  diasLavanderia: string;
  diasModista: string;
  diasTomarMediciones: string;
  cantidadDiasPermitidoRetiro: string;
};

export default function ConfiguracionPage() {
  const [form, setForm] = useState<FormState>({
    diasLavanderia: "",
    diasModista: "",
    diasTomarMediciones: "",
    cantidadDiasPermitidoRetiro: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await obtenerConfiguracionGeneral();
        setForm({
          diasLavanderia: String(data.diasLavanderia),
          diasModista: String(data.diasModista),
          diasTomarMediciones: String(data.diasTomarMediciones),
          cantidadDiasPermitidoRetiro: String(data.cantidadDiasPermitidoRetiro),
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo cargar la configuracion",
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    const payload = {
      diasLavanderia: Number(form.diasLavanderia),
      diasModista: Number(form.diasModista),
      diasTomarMediciones: Number(form.diasTomarMediciones),
      cantidadDiasPermitidoRetiro: Number(form.cantidadDiasPermitidoRetiro),
    };

    if (
      Number.isNaN(payload.diasLavanderia) ||
      Number.isNaN(payload.diasModista) ||
      Number.isNaN(payload.diasTomarMediciones) ||
      Number.isNaN(payload.cantidadDiasPermitidoRetiro) ||
      payload.diasLavanderia < 0 ||
      payload.diasModista < 0 ||
      payload.diasTomarMediciones < 0 ||
      payload.cantidadDiasPermitidoRetiro < 0
    ) {
      toast.error("Todos los campos deben ser numeros enteros mayores o iguales a 0");
      return;
    }

    try {
      setIsSaving(true);
      const updated = await actualizarConfiguracionGeneral(payload);
      setForm({
        diasLavanderia: String(updated.diasLavanderia),
        diasModista: String(updated.diasModista),
        diasTomarMediciones: String(updated.diasTomarMediciones),
        cantidadDiasPermitidoRetiro: String(updated.cantidadDiasPermitidoRetiro),
      });
      toast.success("Configuracion actualizada");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la configuracion",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">
          Configuracion del sistema
        </h1>
        <p className="mt-1 text-sm text-pastel-text/80">
          Parametros operativos usados por el backend para planificar bloqueos.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-28 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : (
        <div className="max-w-xl space-y-3 rounded-lg border border-pastel-border bg-pastel-surface p-4">
          <Input
            type="number"
            label="Dias de lavanderia"
            value={form.diasLavanderia}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, diasLavanderia: value }))
            }
          />
          <Input
            type="number"
            label="Dias de modista"
            value={form.diasModista}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, diasModista: value }))
            }
          />
          <Input
            type="number"
            label="Dias para tomar mediciones"
            value={form.diasTomarMediciones}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, diasTomarMediciones: value }))
            }
          />
          <Input
            type="number"
            label="Cantidad de dias permitido para retiro"
            value={form.cantidadDiasPermitidoRetiro}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, cantidadDiasPermitidoRetiro: value }))
            }
          />
          <Button color="primary" onPress={handleSave} isLoading={isSaving}>
            Guardar configuracion
          </Button>
        </div>
      )}
    </div>
  );
}
