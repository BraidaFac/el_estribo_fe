"use client";
import { APP_LOCALE } from "@/lib/i18n/appLocale";
import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Toaster as SonnerToaster } from "sonner";
import { AppProvider } from "./AppContext";
import AuthGuard from "./AuthGuard";
import Nav from "./Nav";

function LayoutContext({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <body suppressHydrationWarning={true} className="overflow-auto min-h-dvh">
      <HeroUIProvider locale={APP_LOCALE} navigate={router.push}>
        <AppProvider>
          <AuthGuard>
            <SonnerToaster richColors position="top-right" />
            <Nav />
            {children}
          </AuthGuard>
        </AppProvider>
      </HeroUIProvider>
    </body>
  );
}
export default LayoutContext;
