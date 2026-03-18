import { format } from "date-fns";
export function formatDate(date: Date | number) {
  let formatDay = "";
  let formatMonth = "";
  switch (Number(format(date, "i"))) {
    case 1:
      formatDay = "Lunes " + format(date, "d");
      break;
    case 2:
      formatDay = "Martes " + format(date, "d");
      break;
    case 3:
      formatDay = "Miercoles " + format(date, "d");
      break;
    case 4:
      formatDay = "Jueves " + format(date, "d");
      break;
    case 5:
      formatDay = "Viernes " + format(date, "d");
      break;
    case 6:
      formatDay = "Sabado " + format(date, "d");
      break;
    case 7:
      formatDay = "Domingo " + format(date, "d");
      break;
  }

  switch (Number(format(date, "L"))) {
    case 1:
      formatMonth = " de Enero";
      break;
    case 2:
      formatMonth = " de Febrero";
      break;
    case 3:
      formatMonth = " de Marzo";
      break;
    case 4:
      formatMonth = " de Abril";
      break;
    case 5:
      formatMonth = " de Mayo";
      break;
    case 6:
      formatMonth = " de Junio";
      break;
    case 7:
      formatMonth = " de Julio";
      break;
    case 8:
      formatMonth = " de Agosto";
      break;
    case 9:
      formatMonth = " de Septiembre";
      break;
    case 10:
      formatMonth = " de Octubre";
      break;
    case 11:
      formatMonth = " de Noviembre";
      break;
    case 12:
      formatMonth = " de Diciembre";
      break;
  }

  return formatDay + formatMonth;
}

export function formatMonth(date: Date | number) {
  let formatMonth = "";
  switch (Number(format(date, "L"))) {
    case 1:
      formatMonth = "Enero";
      break;
    case 2:
      formatMonth = "Febrero";
      break;
    case 3:
      formatMonth = "Marzo";
      break;
    case 4:
      formatMonth = "Abril";
      break;
    case 5:
      formatMonth = "Mayo";
      break;
    case 6:
      formatMonth = "Junio";
      break;
    case 7:
      formatMonth = "Julio";
      break;
    case 8:
      formatMonth = "Agosto";
      break;
    case 9:
      formatMonth = "Septiembre";
      break;
    case 10:
      formatMonth = "Octubre";
      break;
    case 11:
      formatMonth = "Noviembre";
      break;
    case 12:
      formatMonth = "Diciembre";
      break;
  }

  return `${formatMonth} de ${format(date, "y")}`;
}
