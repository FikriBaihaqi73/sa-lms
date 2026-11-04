import { apiFetch } from "@/lib/api";
import type { Journal, JournalList, JournalParams } from "./types";

export async function getJournals(params: JournalParams): Promise<JournalList> {
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.search) query.set("search", params.search);
  if (params.schedule_id) query.set("schedule_id", params.schedule_id);
  if (params.journal_date) query.set("journal_date", params.journal_date);
  const response: JournalList = await apiFetch(`/teaching-journals?${query}`);
  if (!Array.isArray(response?.data) || !response.meta || typeof response.meta.totalPages !== "number") throw new Error("Respons daftar jurnal tidak valid.");
  return response;
}
export async function getJournal(id: string): Promise<Journal> {
  const response: { data: Journal | null } = await apiFetch(`/teaching-journals/${encodeURIComponent(id)}`);
  if (!response?.data) throw new Error("Respons detail jurnal tidak valid.");
  return response.data;
}
