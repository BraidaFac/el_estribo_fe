"use client";
import {
  Accordion,
  AccordionItem,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { Key, useMemo, useState } from "react";
import { Role } from "../services/auth.service";
import actions from "../utils/cookies";
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
  { key: "calendario", label: "Calendario", href: "/calendario-v2" },
  { key: "diario", label: "Diario", href: "/diario" },
];

/**
 * Planillas agrupadas por dominio (refactor operativo: lavandería / modista / clientes / medición).
 */
const PLANILLAS_NAV_GROUPS: NavGroup[] = [
  {
    key: "lavanderia",
    label: "Lavandería",
    items: [
      { key: "llevar", label: "Llevar a lavandería", href: "/planillas/llevar" },
      { key: "devolver", label: "Retirar de lavandería", href: "/planillas/devolver" },
    ],
  },
  {
    key: "modista",
    label: "Modista",
    items: [
      { key: "llevar-modista", label: "Llevar a modista", href: "/planillas/llevar-modista" },
      { key: "retirar-modista", label: "Retirar de modista", href: "/planillas/retirar-modista" },
    ],
  },
  {
    key: "clientes",
    label: "Clientes",
    items: [
      { key: "retirar", label: "Retiros en el local", href: "/planillas/retirar" },
      { key: "retiros", label: "Devoluciones al local", href: "/planillas/retiros" },
    ],
  },
  {
    key: "medicion",
    label: "Medición",
    items: [
      { key: "contactar-medicion", label: "Contactar medición", href: "/planillas/contactar-medicion" },
      { key: "agenda-mediciones", label: "Agenda de mediciones", href: "/planillas/agenda-mediciones" },
    ],
  },
];

const PLANILLAS_MENU_ITEMS: NavItem[] = PLANILLAS_NAV_GROUPS.flatMap((g) => g.items);

const CONFIG_ITEMS_BY_ROLE: Record<Role, NavItem[]> = {
  [Role.ADMIN]: [
    { key: "lavanderias", label: "Lavanderias", href: "/lavanderias" },
    { key: "modistas", label: "Modistas", href: "/modistas" },
    { key: "sacos", label: "Sacos", href: "/sacos" },
    { key: "pantalones", label: "Pantalones", href: "/pantalones" },
    { key: "feriados", label: "Feriados", href: "/configuracion/feriados" },
    { key: "configuracion", label: "Configuracion del sistema", href: "/configuracion" },
  ],
  [Role.USER]: [],
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
  const role = getRole(user?.role ?? Role.USER);
  const configItems = useMemo(() => CONFIG_ITEMS_BY_ROLE[role], [role]);

  if (!user) return null;

  const onMenuAction = (key: Key) => {
    const allItems = [...PRIMARY_NAV_ITEMS, ...PLANILLAS_MENU_ITEMS, ...configItems];
    const selectedItem = allItems.find((item) => item.key === String(key));
    if (selectedItem) {
      router.push(selectedItem.href);
      setIsMobileOpen(false);
    }
  };

  const onLogout = () => {
    actions.removeItem("Authorization");
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
          {PRIMARY_NAV_ITEMS.map((item) => (
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
          <Dropdown>
            <DropdownTrigger>
              <Button variant="flat" size="sm" className="text-pastel-text">
                Planillas
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Planillas operativas" onAction={onMenuAction}>
              {PLANILLAS_NAV_GROUPS.map((group, idx) => (
                <DropdownSection
                  key={group.key}
                  title={group.label}
                  showDivider={idx < PLANILLAS_NAV_GROUPS.length - 1}
                >
                  {group.items.map((item) => (
                    <DropdownItem
                      key={item.key}
                      className={
                        pathname === item.href ? "bg-pastel-primary/15 text-pastel-primary font-medium" : ""
                      }
                    >
                      {item.label}
                    </DropdownItem>
                  ))}
                </DropdownSection>
              ))}
            </DropdownMenu>
          </Dropdown>
          {configItems.length > 0 && (
            <Dropdown>
              <DropdownTrigger>
                <Button variant="flat" size="sm" className="text-pastel-text">
                  Configuraciones
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Configuraciones" onAction={onMenuAction}>
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
            onPress={() => setIsMobileOpen((prev) => !prev)}
          >
            Menu
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

      {isMobileOpen && (
        <div className="border-t border-pastel-border bg-pastel-surface px-3 py-3 md:hidden">
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-pastel-text/70">
                Principal
              </p>
              <div className="grid grid-cols-1 gap-2">
                {PRIMARY_NAV_ITEMS.map((item) => (
                  <Button
                    key={item.key}
                    size="sm"
                    variant={pathname === item.href ? "solid" : "flat"}
                    className={pathname === item.href ? "bg-pastel-primary text-white" : ""}
                    onPress={() => onMenuAction(item.key)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            <Accordion variant="splitted" selectionMode="multiple">
              {[
                ...PLANILLAS_NAV_GROUPS.map((group) => (
                  <AccordionItem key={group.key} aria-label={group.label} title={group.label}>
                    <div className="grid grid-cols-1 gap-2">
                      {group.items.map((item) => (
                        <Button
                          key={item.key}
                          size="sm"
                          variant={pathname === item.href ? "solid" : "flat"}
                          className={pathname === item.href ? "bg-pastel-primary text-white" : ""}
                          onPress={() => onMenuAction(item.key)}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </AccordionItem>
                )),
                ...(configItems.length > 0
                  ? [
                      <AccordionItem
                        key="config"
                        aria-label="Configuraciones"
                        title="Configuraciones"
                      >
                        <div className="grid grid-cols-1 gap-2">
                          {configItems.map((item) => (
                            <Button
                              key={item.key}
                              size="sm"
                              variant="flat"
                              onPress={() => onMenuAction(item.key)}
                            >
                              {item.label}
                            </Button>
                          ))}
                        </div>
                      </AccordionItem>,
                    ]
                  : []),
              ]}
            </Accordion>

            <Button color="danger" variant="flat" onPress={onLogout}>
              Cerrar sesion
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
