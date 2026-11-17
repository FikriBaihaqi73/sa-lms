import { RotateCcw, Search } from "lucide-react";
import type React from "react";

interface ExaminationFilterProps {
  search: string; classSubjectId: string; assignmentTypeId: string; dateFrom: string; dateTo: string;
  classSubjects: { id: string; label: string }[]; assignmentTypes: { id: string; name: string }[];
  onSearch: (value: string) => void; onClassSubject: (value: string) => void; onAssignmentType: (value: string) => void; onDateFrom: (value: string) => void; onDateTo: (value: string) => void; onReset: () => void;
}

export const ExaminationFilter: React.FC<ExaminationFilterProps> = (props) => (
  <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800/90 dark:bg-[#111927] md:grid-cols-2 xl:grid-cols-6">
    <div className="min-w-0 xl:col-span-2"><label htmlFor="examination_search" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">PENCARIAN UJIAN</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" /><input id="examination_search" value={props.search} onChange={(event) => props.onSearch(event.target.value)} placeholder="Cari judul atau deskripsi ujian..." className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200" /></div></div>
    <FilterSelect id="examination_class_subject" label="1. MATA PELAJARAN KELAS" value={props.classSubjectId} onChange={props.onClassSubject}><option value="">Semua Mata Pelajaran Kelas</option>{props.classSubjects.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</FilterSelect>
    <FilterSelect id="examination_assignment_type" label="2. JENIS TUGAS" value={props.assignmentTypeId} onChange={props.onAssignmentType}><option value="">Semua Jenis Tugas</option>{props.assignmentTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</FilterSelect>
    <FilterDate id="examination_date_from" label="3. DARI TANGGAL" value={props.dateFrom} onChange={props.onDateFrom} />
    <FilterDate id="examination_date_to" label="4. SAMPAI TANGGAL" value={props.dateTo} onChange={props.onDateTo} />
    <div className="self-end pb-0.5"><button type="button" onClick={props.onReset} title="Reset seluruh filter" aria-label="Reset Filter" className="flex size-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-950/20 dark:text-rose-400"><RotateCcw className="size-3.5" /></button></div>
  </div>
);

function FilterSelect({ id, label, value, onChange, children }: { id: string; label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) { return <div className="min-w-0"><label htmlFor={id} className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</label><select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full truncate rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200">{children}</select></div>; }
function FilterDate({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) { return <div className="min-w-0"><label htmlFor={id} className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</label><input id={id} type="date" value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200" /></div>; }
