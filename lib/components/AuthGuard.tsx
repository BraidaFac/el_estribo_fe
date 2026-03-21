"use client";

import { getRedirectForRole, isPublicRoute } from "@/lib/guards/routeAccess";
import { Spinner } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAppContext } from "./AppContext";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthLoading } = useAppContext();

  useEffect(() => {
    if (isAuthLoading) return;

    if (isPublicRoute(pathname)) {
      if (pathname === "/login" && user?.role) {
        router.replace("/calendario-v2");
      }
      return;
    }

    const redirectWithRole = (role: string): void => {
      const redirectPath = getRedirectForRole(role, pathname);
      if (!redirectPath) return;
      router.replace(redirectPath);
    };

    if (user?.role) {
      redirectWithRole(user.role);
      return;
    }

    router.replace("/login");
  }, [isAuthLoading, pathname, router, user]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner color="secondary" />
      </div>
    );
  }

  return <>{children}</>;
}
