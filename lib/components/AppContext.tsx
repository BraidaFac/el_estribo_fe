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

type User = {
  name: string;
  role: string;
} | null;

type AppContextValue = {
  user: User;
  setUser: (user: User) => void;
  isAuthLoading: boolean;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showError: (message: string) => void;
  authError: string | null;
  setAuthError: (error: string | null) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

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
      setIsAuthLoading(false);
    })();

    return () => {
      isCancelled = true;
    };
  }, []);
  //#endregion

  const value = {
    user,
    setUser,
    isAuthLoading,
    showSuccess,
    showWarning,
    showError,
    authError,
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
