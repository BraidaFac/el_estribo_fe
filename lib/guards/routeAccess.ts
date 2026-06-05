const PUBLIC_ROUTES = ["/login"];

/** Rutas que requieren rol ADMIN. */
const ADMIN_ONLY_ROUTES = ["/analytics", "/configuracion/empleados"];

export function normalizeRole(role?: string): string {
  return (role || "").toUpperCase();
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

/** Roles legados que ya no existen en producto se tratan como USER. */
export function getRedirectForRole(
  role: string,
  pathname: string,
): string | null {
  const isAdminOnly = ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r));
  if (isAdminOnly && normalizeRole(role) !== "ADMIN") {
    return "/";
  }
  return null;
}
