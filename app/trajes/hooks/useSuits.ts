import { useAppContext } from "@/lib/components/AppContext";
import { ApiError } from "@/lib/services/http";
import {
  createSuit as createSuitService,
  deleteSuit as deleteSuitService,
  listFreeSuits,
  updateSuit as updateSuitService
} from "@/lib/services/suit.service";
import { Suit } from "@/lib/utils/suit";
import { useCallback } from "react";
import { toast } from "react-hot-toast";

export const useSuits = () => {
  const { showSuccess, showError, fetchSuits } = useAppContext();
 

  const fetchFreeSuits = useCallback(async ({dateString, suit}: {dateString: string, suit: string}) => {
    try {
      const data = await listFreeSuits({dateString, suit});
      return data;
    } catch (error) {
      
      showError("Error al cargar los trajes libres. " + (error as Error).message);
      return [];
    }
  }, [showError]);
  const updateSuit = useCallback(async (suit: Partial<Suit>) => {
    try {
      await updateSuitService(suit);
      showSuccess("Traje actualizado");
      await fetchSuits();
      return true;
    } catch {
      showError("Error al actualizar el traje");
      return false;
    }
  }, [showSuccess, showError, fetchSuits]);

  const deleteSuit = useCallback(async (suitId: string) => {
    try {
      await deleteSuitService(suitId);
      showSuccess("Traje eliminado");
      await fetchSuits();
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        showError("El traje tiene reservas activas");
        return false;
      }
      toast.error("Error al eliminar el traje");
      return false;
    }
  }, [showSuccess, showError, fetchSuits]);

  // Crear un traje nuevo
  const createSuit = useCallback(async (suit: Partial<Suit>) => {
    try {
      await createSuitService(suit);
      showSuccess("Traje creado");
      await fetchSuits();
      return true;
    } catch(error){
      console.log(error);
      if (error instanceof ApiError && error.status === 409) {
        showError("El traje ya existe, por favor ingrese un codigo diferente");
        return false;
      }
      showError( "Error al crear el traje");
      return false;
    }
  }, [showSuccess, showError, fetchSuits]);
  return { fetchSuits, deleteSuit, createSuit, updateSuit, fetchFreeSuits };
};
