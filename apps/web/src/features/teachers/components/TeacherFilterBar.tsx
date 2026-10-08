import { Download, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { TeacherReference } from "../types";

interface TeacherFilterBarProps {
  search: string;
  statusId: string;
  specializationId: string;
  statuses: TeacherReference[];
  specializations: TeacherReference[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSpecializationChange: (value: string) => void;
}

export function TeacherFilterBar({
  search,
  statusId,
  specializationId,
  statuses,
  specializations,
  onSearchChange,
  onStatusChange,
  onSpecializationChange,
}: TeacherFilterBarProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Cari guru</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari nama atau NIP..."
          className="h-10 pl-9"
        />
      </label>
      <div className="flex flex-col gap-2 sm:flex-row lg:items-center">
        <Select
          value={statusId}
          onChange={(event) => onStatusChange(event.target.value)}
          className="h-10 sm:w-48"
          aria-label="Filter status kepegawaian"
        >
          <option value="">Semua status</option>
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </Select>
        <Select
          value={specializationId}
          onChange={(event) => onSpecializationChange(event.target.value)}
          className="h-10 sm:w-52"
          aria-label="Filter spesialisasi"
        >
          <option value="">Semua spesialisasi</option>
          {specializations.map((specialization) => (
            <option key={specialization.id} value={specialization.id}>
              {specialization.name}
            </option>
          ))}
        </Select>
        {/* TODO: Filter lanjutan lain (departemen, tahun masuk, dsb.) belum didukung backend.
            Saat ini hanya search/status/specialization yang diteruskan ke GET /teachers. */}
        <Button type="button" variant="outline" className="h-10" title="Filter yang didukung: status dan spesialisasi">
          <SlidersHorizontal className="mr-2 size-4" /> Filter Lanjutan
        </Button>
        {/* TODO: endpoint export guru (CSV/PDF) belum tersedia di apps/api.
            Jangan wire tombol ini sebelum endpointnya ada. */}
        <span title="Belum tersedia">
          <Button type="button" variant="outline" className="h-10" disabled>
            <Download className="mr-2 size-4" /> Ekspor
          </Button>
        </span>
      </div>
    </div>
  );
}
