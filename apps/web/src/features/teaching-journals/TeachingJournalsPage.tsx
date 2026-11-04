import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getJournal, getJournals } from "./api";
import type { JournalParams } from "./types";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const inputClass = "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
function dateLabel(date: string | null) {
  if (!date) return "—";
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? "—" : new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "UTC" }).format(value);
}

export function TeachingJournalsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [schedule, setSchedule] = useState("");
  const [error, setError] = useState("");
  const [params, setParams] = useState<JournalParams>({ page: 1, limit: 10 });
  const [selected, setSelected] = useState<string | null>(null);
  const list = useQuery({ queryKey: ["teaching-journals", user?.id, params], queryFn: () => getJournals(params), gcTime: 0 });
  const detail = useQuery({ queryKey: ["teaching-journals", user?.id, "detail", selected], queryFn: () => getJournal(selected!), enabled: selected !== null, gcTime: 0 });
  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = schedule.trim();
    if (id && !uuid.test(id)) { setError("ID jadwal harus berupa UUID yang valid."); return; }
    setError("");
    setParams({ page: 1, limit: 10, ...(search.trim() ? { search: search.trim() } : {}), ...(date ? { journal_date: date } : {}), ...(id ? { schedule_id: id } : {}) });
  }
  const page = params.page;
  return <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-[#0f172a] dark:text-slate-50 sm:p-6">
    <div className="mx-auto max-w-7xl space-y-6">
      <header><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Jurnal Mengajar</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Lihat jurnal kegiatan mengajar di institusi Anda.</p></header>
      <form onSubmit={applyFilters} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <label className="space-y-1 text-sm font-medium"><span>Pencarian</span><input className={inputClass} value={search} onChange={e => setSearch(e.target.value)} placeholder="Topik, materi, atau catatan" /></label>
        <label className="space-y-1 text-sm font-medium"><span>Tanggal mengajar</span><input className={inputClass} type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
        <label className="space-y-1 text-sm font-medium"><span>ID jadwal</span><input className={inputClass} value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="UUID jadwal" aria-invalid={!!error} aria-describedby={error ? "schedule-error" : undefined} /></label>
        <Button type="submit">Terapkan filter</Button>
        {error && <p id="schedule-error" role="alert" className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      </form>
      <section aria-label="Daftar jurnal" className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {list.isPending ? <p role="status" className="p-6 text-sm">Memuat jurnal...</p> : list.isError ? <div role="alert" className="space-y-3 p-6 text-sm"><p>Gagal memuat jurnal. Silakan coba lagi.</p><Button type="button" variant="outline" onClick={() => list.refetch()}>Coba lagi</Button></div> : list.data.data.length === 0 ? <p className="p-6 text-sm text-slate-500">Tidak ada jurnal yang sesuai.</p> : <div className="overflow-x-auto"><table className="w-full min-w-175 text-left text-sm"><thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><tr><th className="p-4">Tanggal</th><th className="p-4">Pertemuan</th><th className="p-4">Topik</th><th className="p-4">Jadwal</th><th className="p-4">Aksi</th></tr></thead><tbody>{list.data.data.map(journal => <tr key={journal.id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-4">{dateLabel(journal.journal_date)}</td><td className="p-4">{journal.meeting_number ?? "—"}</td><td className="p-4">{journal.topic || "—"}</td><td className="p-4"><span className="block">{journal.schedule?.day || "—"}</span><span className="text-xs text-slate-500">{journal.schedule_id}</span></td><td className="p-4"><Button type="button" variant="outline" onClick={() => setSelected(journal.id)}>Lihat detail</Button></td></tr>)}</tbody></table></div>}
        {list.isSuccess && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 text-sm dark:border-slate-800"><span>Halaman {page} dari {Math.max(list.data.meta.totalPages, 1)} · {list.data.meta.totalData} jurnal</span><div className="flex gap-2"><Button type="button" variant="outline" disabled={page <= 1 || list.isFetching} onClick={() => setParams(p => ({ ...p, page: p.page - 1 }))}>Sebelumnya</Button><Button type="button" variant="outline" disabled={page >= list.data.meta.totalPages || list.isFetching} onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))}>Berikutnya</Button></div></div>}
      </section>
    </div>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Detail Jurnal Mengajar</DialogTitle><DialogDescription>Informasi kegiatan mengajar.</DialogDescription></DialogHeader>{detail.isPending ? <p role="status">Memuat detail...</p> : detail.isError ? <div role="alert" className="space-y-3"><p>Gagal memuat detail jurnal.</p><Button type="button" variant="outline" onClick={() => detail.refetch()}>Coba lagi</Button></div> : <dl className="space-y-3 text-sm">{[["Tanggal", dateLabel(detail.data.journal_date)], ["Pertemuan", detail.data.meeting_number?.toString() ?? "—"], ["ID jadwal", detail.data.schedule_id], ["Hari", detail.data.schedule?.day || "—"], ["Topik", detail.data.topic || "—"], ["Materi", detail.data.material || "—"], ["Catatan", detail.data.notes || "—"]].map(([label, value]) => <div key={label}><dt className="font-semibold">{label}</dt><dd className="mt-1 whitespace-pre-wrap wrap-break-word text-slate-600 dark:text-slate-300">{value}</dd></div>)}</dl>}</DialogContent></Dialog>
  </main>;
}
