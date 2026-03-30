export type DateOnlyInput = Date | string | number;

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_PREFIX_REGEX = /^\d{4}-\d{2}-\d{2}T/;

export function formatApiDate(input: DateOnlyInput): string {
  if (input instanceof Date) {
    return formatDateFromLocalParts(input);
  }

  if (typeof input === "string") {
    const trimmedInput = input.trim();

    if (DATE_ONLY_REGEX.test(trimmedInput)) {
      return trimmedInput;
    }

    if (ISO_PREFIX_REGEX.test(trimmedInput)) {
      return trimmedInput.slice(0, 10);
    }

    const parsed = new Date(trimmedInput);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid date input: ${input}`);
    }

    return formatDateFromLocalParts(parsed);
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date input: ${input}`);
  }

  return formatDateFromLocalParts(parsed);
}

function formatDateFromLocalParts(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
