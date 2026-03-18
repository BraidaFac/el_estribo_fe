const PUBLIC_ROUTES = ["/login"];
const LAUNDRY_ALLOWED_ROUTES = ["/planillas/retirar", "/diario"];

export function normalizeRole(role?: string): string {
  return (role || "").toUpperCase();
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

export function isLaundryRole(role?: string): boolean {
  return normalizeRole(role) === "LAUNDRY";
}

export function getRedirectForRole(
  role: string,
  pathname: string,
): string | null {
  const normalizedRole = normalizeRole(role);

  if (pathname === "/signup" && normalizedRole !== "ADMIN") {
    return isLaundryRole(normalizedRole) ? "/planillas/retirar" : "/";
  }

  if (
    isLaundryRole(normalizedRole) &&
    !LAUNDRY_ALLOWED_ROUTES.includes(pathname)
  ) {
    return "/planillas/retirar";
  }

  return null;
}
