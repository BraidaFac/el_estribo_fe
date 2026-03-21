import { ApiError } from "@/lib/services/http";
import { formatIsoDatesInText } from "@/lib/utils/formatApiDate";

export function getUserFacingErrorMessage(error: unknown): string {
  let message: string;

  if (!(error instanceof ApiError)) {
    if (error instanceof Error && error.message) {
      message = error.message;
    } else {
      message = "Ocurrio un error inesperado. Intenta nuevamente.";
    }
    return formatIsoDatesInText(message);
  }

  if (error.status >= 500) {
    message = "El servidor no pudo procesar la solicitud. Intenta nuevamente en unos minutos.";
  } else if (error.status === 404) {
    message = "No se encontro el recurso solicitado o ya no esta activo.";
  } else if (error.status === 409) {
    message = "La accion entro en conflicto con otro cambio reciente. Refresca e intenta de nuevo.";
  } else if (error.status === 401 || error.status === 403) {
    message = "Tu sesion no tiene permisos para esta accion. Vuelve a iniciar sesion.";
  } else if (error.status === 400) {
    message = error.message || "Hay datos invalidos en el formulario.";
  } else {
    message = error.message || "No se pudo completar la accion.";
  }

  return formatIsoDatesInText(message);
}
