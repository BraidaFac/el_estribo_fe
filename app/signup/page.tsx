"use client";
import { useUserState } from "@/lib/utils/UserState";
import { API_BACKEND } from "@/lib/utils/constanst";
import { Button, Input, Spinner } from "@heroui/react";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import CookiesUtils from "../../lib/utils/cookies";
export default function Signup() {
  const { setUser } = useUserState();
  const router = useRouter();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userName = formData.get("username");
    const name = formData.get("name");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setIsSuccess(false);
      setError(true);
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    const payload = JSON.stringify({ userName, password, name });
    let response = await fetch(`${API_BACKEND}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    // Compatibilidad con backends que exponen /auth/register.
    if (!response.ok && response.status === 404) {
      response = await fetch(`${API_BACKEND}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
    }

    if (response.ok) {
      setIsSuccess(true);
      setError(false);
      setErrorMessage("");
      router.push("/login");
    } else {
      let message = "No se pudo registrar el usuario";
      try {
        const data = await response.json();
        if (data?.message) message = data.message;
      } catch (_e) {}
      setIsSuccess(false);
      setError(true);
      setErrorMessage(message);
    }
  }

  return (
    <div className="min-h-[78vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl md:text-4xl font-semibold text-pastel-text tracking-wide">
        Crear cuenta
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md mt-8">
        <div className="flex flex-col gap-3 bg-pastel-surface/90 border border-pastel-border rounded-2xl p-6 md:p-8 shadow-md">
          <label className="text-pastel-text text-lg md:text-xl">Nombre</label>
          <Input
            type="text"
            placeholder="Nombre y apellido"
            name="name"
            required
            autoComplete="off"
          />
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
          <label className="text-pastel-text text-lg md:text-xl mt-1">
            Confirmar password
          </label>
          <Input
            type="password"
            placeholder="Repetir password"
            name="confirmPassword"
            required
            autoComplete="off"
          />
          {isSuccess && (
            <span className="text-green-700">
              Usuario creado. Redirigiendo a login...
            </span>
          )}
          {error && <span className="text-red-600">{errorMessage}</span>}
          <Button
            type="submit"
            className="mt-4 w-full bg-pastel-primary text-white font-semibold"
          >
            Registrarme
          </Button>
          <Button
            type="button"
            variant="light"
            className="w-full text-pastel-text"
            onClick={() => router.push("/login")}
          >
            Ya tengo cuenta
          </Button>
        </div>
      </form>
    </div>
  );
}
