import type { IconType } from "react-icons";
import {
  GiArmoredPants,
  GiBelt,
  GiBowTie,
  GiClothes,
  GiFedora,
  GiGloves,
  GiLargeDress,
  GiPoloShirt,
  GiSunglasses,
  GiTie,
  GiTopHat,
} from "react-icons/gi";
import { FaGlasses, FaTshirt } from "react-icons/fa";
import { TbHanger, TbShirt } from "react-icons/tb";

export type { IconType };

export const ACCESORIOS_ICON_MAP: Record<string, IconType> = {
  GiTie,
  GiBowTie,
  GiBelt,
  FaGlasses,
  GiSunglasses,
  GiTopHat,
  GiFedora,
  GiGloves,
  TbHanger,
  GiClothes,
  FaTshirt,
  GiLargeDress,
  GiPoloShirt,
  GiArmoredPants,
  TbShirt,
};

export const ACCESORIOS_ICON_LABELS: Record<string, string> = {
  GiTie: "Corbata",
  GiBowTie: "Moño / corbatín",
  GiBelt: "Cinturón",
  FaGlasses: "Lentes",
  GiSunglasses: "Anteojos de sol",
  GiTopHat: "Sombrero formal",
  GiFedora: "Sombrero casual",
  GiGloves: "Guantes",
  TbHanger: "Accesorios / prenda",
  GiClothes: "Conjunto",
  FaTshirt: "Camisa / remera",
  GiLargeDress: "Traje formal",
  GiPoloShirt: "Camisa formal",
  GiArmoredPants: "Pantalón",
  TbShirt: "Prenda superior",
};

export const ACCESORIOS_ICON_OPTIONS = Object.keys(ACCESORIOS_ICON_MAP);

export function getAccesorioIcon(icono: string): IconType {
  return ACCESORIOS_ICON_MAP[icono] ?? TbHanger;
}
