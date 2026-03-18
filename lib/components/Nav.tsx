"use client";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { Key } from "react";
import { Role } from "../services/auth.service";
import actions from "../utils/cookies";
import { useAppContext } from "./AppContext";
import Logo from "./Logo/Logo";

type NavItem = {
  key: string;
  label: string;
  href: string;
};

const NAV_ITEMS_BY_ROLE: Record<Role, NavItem[]> = {
  [Role.ADMIN]: [
    { key: "carryLaundry", label: "Llevar lavanderia", href: "/planillas/llevar" },
    { key: "takeLaundry", label: "Retirar lavanderia", href: "/planillas/retirar" },
    { key: "soonBookings", label: "Proximos retiros", href: "/planillas/retiros" },
    {
      key: "rememberReturns",
      label: "Proximas devoluciones",
      href: "/planillas/devolucion",
    },
    { key: "history", label: "Historial", href: "/reservas" },
    { key: "reservas", label: "Calendario de reservas", href: "/diario" },
    { key: "suits", label: "Trajes", href: "/trajes" },
  ],
  [Role.LAUNDRY]: [
    { key: "takeLaundry", label: "Lavanderia", href: "/planillas/retirar" },
    { key: "reservas", label: "Calendario de reservas", href: "/diario" },
  ],
  [Role.USER]: [
    { key: "takeLaundry", label: "Retirar lavanderia", href: "/planillas/retirar" },
    { key: "reservas", label: "Calendario de reservas", href: "/diario" },
  ],
};

function getNavItemsForRole(role: string): NavItem[] {
  if (role === Role.ADMIN) return NAV_ITEMS_BY_ROLE[Role.ADMIN];
  if (role === Role.LAUNDRY) return NAV_ITEMS_BY_ROLE[Role.LAUNDRY];
  return NAV_ITEMS_BY_ROLE[Role.USER];
}

const Nav = () => {
  const { user, setUser } = useAppContext();
  const router = useRouter();

  if (!user) return null;

  const navItems = getNavItemsForRole(user.role);

  const onMenuAction = (key: Key) => {
    const selectedItem = navItems.find((item) => item.key === String(key));
    if (selectedItem) {
      router.push(selectedItem.href);
    }
  };

  const onLogout = () => {
    actions.removeItem("Authorization");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="top-0 z-40 w-full ">
      <div className="mx-auto grid h-12 md:h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-3 md:px-6 text-pastel-text">
        <div className="flex w-24 md:w-28 items-center justify-start">
          <Logo />  
        </div>

        <div className="justify-self-center">
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                size="sm"
                className="min-w-24 text-pastel-text border-pastel-border bg-pastel-surface/50 md:size-md"
              >
                Menu
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Menu de navegacion" onAction={onMenuAction}>
              {navItems.map((item) => (
                <DropdownItem key={item.key}>{item.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="w-24 md:w-28 justify-self-end">
        
        </div>
      </div>
    </nav>
  );
};

export default Nav;
