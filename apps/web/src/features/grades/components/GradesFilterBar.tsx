import { Search } from "lucide-react";
import { Select } from "@/components/ui/select";

interface Props {
  classFilter: string; subjectFilter: string; semesterFilter: string; search: string;
  classOptions: string[]; subjectOptions: string[]; semesterOptions: string[];
  onClassChange: (v: string) => void; onSubjectChange: (v: string) => void;
  onSemesterChange: (v: string) => void; onSearchChange: (v: string) => void;
}

export function GradesFilterBar(p: Props) {
  const box = "h-10 rounded-lg border border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-slate-800";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="relative md:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input value={p.search} onChange={(e) => p.onSearchChange(e.target.value)}
            placeholder="Cari siswa, NIS, mapel..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-transparent pl-9 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/30" />
        </div>
        <Select value={p.classFilter} onChange={(e) => p.onClassChange(e.target.value)} className={box}>
          {p.classOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
        <Select value={p.subjectFilter} onChange={(e) => p.onSubjectChange(e.target.value)} className={box}>
          {p.subjectOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
        <Select value={p.semesterFilter} onChange={(e) => p.onSemesterChange(e.target.value)} className={box}>
          {p.semesterOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      </div>
    </div>
  );
}
