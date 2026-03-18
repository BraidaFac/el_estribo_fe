import { formatApiDate } from "@/lib/utils/dateOnly";
import { Suit } from "@/lib/utils/suit";
import { apiFetch } from "./http";

export async function listSuits(): Promise<Suit[]> {
  return apiFetch<Suit[]>("/suit");
}

export async function listSuitsToLaundry(): Promise<Suit[]> {
  return apiFetch<Suit[]>("/suit/laundry");
}

export async function listSuitsInLaundry(): Promise<Suit[]> {
  return apiFetch<Suit[]>("/suit/laundry/in");
}

export async function listSuitsToTakeFromLaundry(): Promise<Suit[]> {
  return apiFetch<Suit[]>("/suit/laundry/take");
}

export async function listFreeSuits({dateString, suit}: {dateString?: string, suit?: string}): Promise<Suit[]> {
  return apiFetch<Suit[]>(`/suit/free?date=${dateString ? formatApiDate(dateString) : ""}&suit=${suit ? suit : ""}`);
}

export async function updateSuit(suit: Partial<Suit>): Promise<void> {
  await apiFetch(`/suit/${suit.id}`, {
    method: "PATCH",
    body: JSON.stringify(suit),
  });
}

export async function createSuit(suit: Partial<Suit>): Promise<void> {
  await apiFetch("/suit", {
    method: "POST",
    body: JSON.stringify(suit),
  });
}

export async function deleteSuit(suitId: string): Promise<void> {
  await apiFetch(`/suit/${suitId}`, {
    method: "DELETE",
  });
}
