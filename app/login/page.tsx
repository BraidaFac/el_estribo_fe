"use client";
import { useAppContext } from "@/lib/components/AppContext";
import {
  login,
  Role
} from "@/lib/services/auth.service";
import { Button, Input } from "@heroui/react";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import CookiesUtils from "../../lib/utils/cookies";
export default function Login() {
  const { setUser, authError, setAuthError , user, isAuthLoading } = useAppContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectByRole = useCallback(
    (role: string) => {
      if (role === Role.LAUNDRY) {
        router.replace("/planillas/retirar");
        return;
      }
      router.replace("/");
    },
    [router],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const userName = formData.get("username");
    const password = formData.get("password");

    try {
      setIsSubmitting(true);
      setAuthError(null);
      const { access_token, user } = await login(userName, password);
      const token = `Bearer ${access_token}`;
      CookiesUtils.setItem("Authorization", token);
      setUser(user);
      redirectByRole(user.role);
    } catch {
      setAuthError("Credenciales invalidas");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (user) {
      redirectByRole(user.role);
    }
  }, [redirectByRole, user]);

/*   if (isCheckingSession) {
    return (
      <div className="min-h-[78vh] flex items-center justify-center px-4">
        <p className="text-pastel-text">Verificando sesion...</p>
      </div>
    );
  } */

  return (
    <>
    {!isAuthLoading && (
    <div className="min-h-[78vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl md:text-4xl font-semibold text-pastel-text tracking-wide">
        Login
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md mt-8">
        <div className="flex flex-col gap-3 bg-pastel-surface/90 border border-pastel-border rounded-2xl p-6 md:p-8 shadow-md">
          <label className="text-pastel-text text-lg md:text-xl">Usuario</label>
          <Input
            type="text"
            placeholder="Username"
            name="username"
            required
            autoComplete="off"
          />
          <label className="text-pastel-text text-lg md:text-xl mt-1">
            Password
          </label>
          <Input
            type="password"
            placeholder="Password"
            name="password"
            required
            autoComplete="off"
          />
          {authError && (
            <span className="text-red-600">Credenciales invalidas</span>
          )}
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="mt-4 w-full bg-pastel-primary text-white font-semibold"
          >
            Ingresar
          </Button>
        </div>
      </form>
    </div>
    )}
    </>
  );
}
