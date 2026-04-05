const PUBLIC_ROUTES = ["/login"];

export function normalizeRole(role?: string): string {
  return (role || "").toUpperCase();
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

/** Roles legados que ya no existen en producto se tratan como USER. */
export function getRedirectForRole(
  _role: string,
  _pathname: string,
): string | null {
  return null;
}
