export interface Journal {
  id: string;
  schedule_id: string;
  meeting_number: number | null;
  journal_date: string | null;
  topic: string | null;
  material: string | null;
  notes: string | null;
  schedule: { id: string; day: string; startTime: string | null; endTime: string | null };
}
export interface JournalParams { page: number; limit: number; search?: string; schedule_id?: string; journal_date?: string }
export interface JournalList { data: Journal[]; meta: { currentPage: number; perPage: number; totalData: number; totalPages: number } }
