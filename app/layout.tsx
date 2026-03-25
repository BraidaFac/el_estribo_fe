import LayoutContext from "@/lib/components/LayoutContext";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "El Estribo",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <LayoutContext>{children}</LayoutContext>
    </html>
  );
}
