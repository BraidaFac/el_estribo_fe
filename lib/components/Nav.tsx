"use client";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { deleteCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import { Key, useEffect, useMemo, useState } from "react";
import { Role } from "../services/auth.service";
import { useAppContext } from "./AppContext";
import Logo from "./Logo/Logo";

type NavItem = {
  key: string;
  label: string;
  href: string;
};

type NavGroup = {
  key: string;
  label: string;
  items: NavItem[];
};

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { key: "inicio", label: "Inicio", href: "/" },
  { key: "calendario", label: "Calendario", href: "/calendario-v2" },
  { key: "diario", label: "Diario", href: "/diario" },
  {
    key: "seguimiento-reservas",
    label: "Seguimiento de reservas",
    href: "/seguimiento-reservas",
  },
];

const ADMIN_PRIMARY_NAV_ITEMS: NavItem[] = [
  { key: "analytics", label: "Estadística", href: "/analytics" },
];

/**
 * Planillas agrupadas por dominio (refactor operativo: lavandería / modista / clientes / medición).
 */
const PLANILLAS_NAV_GROUPS: NavGroup[] = [
  {
    key: "lavanderia",
    label: "Lavandería",
    items: [
      {
        key: "llevar",
        label: "Llevar a lavandería",
        href: "/planillas/llevar",
      },
      {
        key: "devolver",
        label: "Retirar de lavandería",
        href: "/planillas/devolver",
      },
    ],
  },
  {
    key: "modista",
    label: "Modista",
    items: [
      {
        key: "llevar-modista",
        label: "Llevar a modista",
        href: "/planillas/llevar-modista",
      },
      {
        key: "retirar-modista",
        label: "Retirar de modista",
        href: "/planillas/retirar-modista",
      },
    ],
  },
  {
    key: "clientes",
    label: "Clientes",
    items: [
      {
        key: "retirar",
        label: "Retiros en el local",
        href: "/planillas/retirar",
      },
      {
        key: "retiros",
        label: "Devoluciones al local",
        href: "/planillas/retiros",
      },
    ],
  },
  {
    key: "medicion",
    label: "Medición",
    items: [
      {
        key: "contactar-medicion",
        label: "Contactar medición",
        href: "/planillas/contactar-medicion",
      },
      {
        key: "agenda-mediciones",
        label: "Agenda de mediciones",
        href: "/planillas/agenda-mediciones",
      },
    ],
  },
  {
    key: "local",
    label: "Local",
    items: [
      {
        key: "preparar-entrega",
        label: "Preparar para entrega",
        href: "/planillas/local/preparar-entrega",
      },
      {
        key: "rechazados-pre-entrega",
        label: "Rechazados pre-entrega",
        href: "/planillas/local/rechazados-pre-entrega",
      },
    ],
  },
];

const PLANILLAS_MENU_ITEMS: NavItem[] = PLANILLAS_NAV_GROUPS.flatMap(
  (g) => g.items,
);

/** Divide grupos en dos columnas equilibradas (p. ej. 3 + 2 con 5 grupos). */
const PLANILLAS_SPLIT_INDEX = Math.ceil(PLANILLAS_NAV_GROUPS.length / 2);
const PLANILLAS_NAV_LEFT = PLANILLAS_NAV_GROUPS.slice(0, PLANILLAS_SPLIT_INDEX);
const PLANILLAS_NAV_RIGHT = PLANILLAS_NAV_GROUPS.slice(PLANILLAS_SPLIT_INDEX);

const CONFIG_ITEMS_BY_ROLE: Record<Role, NavItem[]> = {
  [Role.ADMIN]: [
    { key: "lavanderias", label: "Lavanderias", href: "/lavanderias" },
    { key: "modistas", label: "Modistas", href: "/modistas" },
    { key: "sacos", label: "Sacos", href: "/sacos" },
    { key: "pantalones", label: "Pantalones", href: "/pantalones" },
    { key: "feriados", label: "Feriados", href: "/configuracion/feriados" },
    {
      key: "configuracion",
      label: "Configuracion del sistema",
      href: "/configuracion",
    },
    { key: "empleados", label: "Empleados", href: "/configuracion/empleados" },
    {
      key: "accesorios",
      label: "Accesorios",
      href: "/configuracion/accesorios",
    },
  ],
  [Role.USER]: [
    {
      key: "accesorios",
      label: "Accesorios",
      href: "/configuracion/accesorios",
    },
    { key: "lavanderias", label: "Lavanderias", href: "/lavanderias" },
    { key: "modistas", label: "Modistas", href: "/modistas" },
    { key: "sacos", label: "Sacos", href: "/sacos" },
    { key: "pantalones", label: "Pantalones", href: "/pantalones" },
  ],
};

function getRole(role: string): Role {
  if (role === Role.ADMIN) return Role.ADMIN;
  return Role.USER;
}

const Nav = () => {
  const { user, setUser } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  /** Popover "Planillas" y Dropdown "Configuraciones" no se cierran solos al navegar con router.push. */
  const [isPlanillasOpen, setIsPlanillasOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const role = getRole(user?.role ?? Role.USER);
  const configItems = useMemo(
    () =>
      [...CONFIG_ITEMS_BY_ROLE[role]].sort((a, b) =>
        a.label.localeCompare(b.label),
      ),
    [role],
  );

  /** Misma regla que Tailwind `md:` (768px): al pasar a escritorio, cerrar el drawer. */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsMobileOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (!user) return null;

  const onMenuAction = (key: Key) => {
    const allItems = [
      ...PRIMARY_NAV_ITEMS,
      ...ADMIN_PRIMARY_NAV_ITEMS,
      ...PLANILLAS_MENU_ITEMS,
      ...configItems,
    ];
    const selectedItem = allItems.find((item) => item.key === String(key));
    if (selectedItem) {
      setIsPlanillasOpen(false);
      setIsConfigOpen(false);
      router.push(selectedItem.href);
      setIsMobileOpen(false);
    }
  };

  const onLogout = () => {
    deleteCookie("Authorization");
    setUser(null);
    setIsMobileOpen(false);
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-pastel-border bg-pastel-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 md:h-16 md:px-6 text-pastel-text">
        <div className="flex w-24 md:w-28 items-center justify-start">
          <Logo />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {[
            ...PRIMARY_NAV_ITEMS,
            ...(role === Role.ADMIN ? ADMIN_PRIMARY_NAV_ITEMS : []),
          ].map((item) => (
            <Button
              key={item.key}
              size="sm"
              variant={pathname === item.href ? "solid" : "flat"}
              className={
                pathname === item.href
                  ? "bg-pastel-primary text-white"
                  : "text-pastel-text"
              }
              onPress={() => onMenuAction(item.key)}
            >
              {item.label}
            </Button>
          ))}
          <Popover
            placement="bottom-start"
            offset={8}
            isOpen={isPlanillasOpen}
            onOpenChange={setIsPlanillasOpen}
          >
            <PopoverTrigger>
              <Button variant="flat" size="sm" className="text-pastel-text">
                Planillas
              </Button>
            </PopoverTrigger>
            <PopoverContent
              aria-label="Planillas operativas"
              className="w-auto max-w-[min(90vw,36rem)] border border-pastel-border bg-pastel-surface p-0 shadow-lg"
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-3">
                {[PLANILLAS_NAV_LEFT, PLANILLAS_NAV_RIGHT].map(
                  (column, colIdx) => (
                    <div
                      key={colIdx === 0 ? "planillas-col-a" : "planillas-col-b"}
                      className="flex min-w-0 flex-col gap-4"
                    >
                      {column.map((group) => (
                        <div key={group.key} className="space-y-1.5">
                          <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-pastel-text/60">
                            {group.label}
                          </p>
                          <div className="flex flex-col gap-0.5">
                            {group.items.map((item) => (
                              <Button
                                key={item.key}
                                variant="light"
                                size="sm"
                                className={`h-8 min-h-8 justify-start px-2 font-normal ${
                                  pathname === item.href
                                    ? "bg-pastel-primary/15 text-pastel-primary font-medium"
                                    : "text-pastel-text"
                                }`}
                                onPress={() => onMenuAction(item.key)}
                              >
                                {item.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                )}
              </div>
            </PopoverContent>
          </Popover>
          {configItems.length > 0 && (
            <Dropdown isOpen={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DropdownTrigger>
                <Button variant="flat" size="sm" className="text-pastel-text">
                  Configuraciones
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Configuraciones"
                onAction={onMenuAction}
              >
                {configItems.map((item) => (
                  <DropdownItem key={item.key}>{item.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
        </div>

        <div className="flex w-24 md:w-28 justify-end gap-2">
          <Button
            size="sm"
            variant="flat"
            className="md:hidden"
            aria-expanded={isMobileOpen}
            aria-controls="nav-mobile-drawer"
            onPress={() => setIsMobileOpen((prev) => !prev)}
          >
            Menú
          </Button>
          <Button
            size="sm"
            variant="flat"
            className="hidden md:inline-flex"
            onPress={onLogout}
          >
            Salir
          </Button>
        </div>
      </div>

      <Drawer
        id="nav-mobile-drawer"
        isOpen={isMobileOpen}
        onOpenChange={setIsMobileOpen}
        placement="right"
        backdrop="blur"
        scrollBehavior="inside"
        size="sm"
        className="md:hidden"
        classNames={{
          base: "border-l border-pastel-border bg-pastel-surface sm:max-w-[min(22rem,calc(100vw-1rem))]",
          body: "px-4 py-2",
          header: "border-b border-pastel-border",
          footer: "border-t border-pastel-border",
        }}
      >
        <DrawerContent>
          <DrawerHeader className="flex flex-col gap-0.5 px-4 py-3">
            <span className="text-lg font-semibold text-pastel-text">
              Navegación
            </span>
            <span className="text-xs font-normal text-pastel-text/60">
              Elegí una sección
            </span>
          </DrawerHeader>
          <DrawerBody className="gap-0 overflow-y-auto">
            <div className="space-y-5 pb-2">
              <section>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-pastel-text/60">
                  Principal
                </p>
                <div className="flex flex-col gap-1.5">
                  {[
                    ...PRIMARY_NAV_ITEMS,
                    ...(role === Role.ADMIN ? ADMIN_PRIMARY_NAV_ITEMS : []),
                  ].map((item) => (
                    <Button
                      key={item.key}
                      fullWidth
                      size="md"
                      radius="sm"
                      variant={pathname === item.href ? "solid" : "flat"}
                      className={`min-h-11 justify-start px-3 text-left ${
                        pathname === item.href
                          ? "bg-pastel-primary text-white"
                          : "text-pastel-text"
                      }`}
                      onPress={() => onMenuAction(item.key)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </section>

              <div className="border-t border-pastel-border/80" />

              <section>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-pastel-text/60">
                  Planillas
                </p>
                <div className="space-y-5">
                  {PLANILLAS_NAV_GROUPS.map((group) => (
                    <div key={group.key} className="space-y-2">
                      <p className="text-sm font-semibold text-pastel-text">
                        {group.label}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {group.items.map((item) => (
                          <Button
                            key={item.key}
                            fullWidth
                            size="md"
                            radius="sm"
                            variant={pathname === item.href ? "solid" : "flat"}
                            className={`min-h-11 justify-start px-3 text-left font-normal ${
                              pathname === item.href
                                ? "bg-pastel-primary text-white"
                                : "text-pastel-text"
                            }`}
                            onPress={() => onMenuAction(item.key)}
                          >
                            {item.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {configItems.length > 0 ? (
                <>
                  <div className="border-t border-pastel-border/80" />
                  <section>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-pastel-text/60">
                      Configuración
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {configItems.map((item) => (
                        <Button
                          key={item.key}
                          fullWidth
                          size="md"
                          radius="sm"
                          variant="flat"
                          className="min-h-11 justify-start px-3 text-left font-normal text-pastel-text"
                          onPress={() => onMenuAction(item.key)}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </section>
                </>
              ) : null}
            </div>
          </DrawerBody>
          <DrawerFooter className="px-4 py-3">
            <Button
              fullWidth
              color="danger"
              variant="flat"
              className="min-h-11"
              onPress={onLogout}
            >
              Cerrar sesión
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </nav>
  );
};

export default Nav;
