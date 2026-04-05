import {
  AcademicCapIcon,
  BriefcaseIcon,
  GiftIcon,
  HeartIcon,
  PaperClipIcon,
  ScissorsIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
  TagIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export type HeroIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const ACCESORIOS_ICON_MAP: Record<string, HeroIconComponent> = {
  AcademicCapIcon,
  BriefcaseIcon,
  GiftIcon,
  HeartIcon,
  PaperClipIcon,
  ScissorsIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
  TagIcon,
  WrenchScrewdriverIcon,
};

export const ACCESORIOS_ICON_OPTIONS = Object.keys(ACCESORIOS_ICON_MAP);

export function getAccesorioIcon(icono: string): HeroIconComponent {
  return ACCESORIOS_ICON_MAP[icono] ?? TagIcon;
}
