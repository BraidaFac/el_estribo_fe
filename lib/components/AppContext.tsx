"use client";

import { getCookie } from "cookies-next";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { extractBearerToken, validateToken } from "../services/auth.service";
import { listSuits } from "../services/suit.service";
import { Suit } from "../utils/suit";

type User = {
  name: string;
  role: string;
} | null;

type AppContextValue = {
  user: User;
  setUser: (user: User) => void;
  suit: Suit | null;
  setSuit: (suit: Suit | null) => void;
  suits: Suit[];
  setSuits: (suits: Suit[]) => void;
  fetchSuits: () => void;
  isAuthLoading: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showError: (message: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
  authError: string | null;
  setAuthError: (error: string | null) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [suit, setSuit] = useState<Suit | null>(null);
  const [suits, setSuits] = useState<Suit[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  //#region Suits

  const fetchSuits = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listSuits();
      setSuits(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al cargar los trajes",
      );
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError, setSuits]);
 //#endregion

  //#region Toaster
  const showSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showWarning = useCallback((message: string) => {
    toast.warning(message);
  }, []);

  const showError = useCallback((message: string) => {
    toast.error(message);
  }, []);
  //#endregion

  //#region user
  useEffect(() => {
    let isCancelled = false;
    const token = extractBearerToken(getCookie("Authorization"));
    if (!token) {
      setUser(null);
      setIsAuthLoading(false);
      return;
    }

    (async () => {
      const validatedUser = await validateToken(token);
      if (isCancelled) return;
      setUser(validatedUser);
      fetchSuits();
      setIsAuthLoading(false);
      fetchSuits();
    })();

    return () => {
      isCancelled = true;
    };
  }, [fetchSuits]);
  //#endregion

  const value = {
    user,
    setUser,
    suit,
    setSuit,
    suits,
    setSuits,
    isAuthLoading,
    isLoading,
    setIsLoading,
    showSuccess,
    showWarning,
    showError,
    error,
    setError,
    authError,
    fetchSuits,
    setAuthError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
}
