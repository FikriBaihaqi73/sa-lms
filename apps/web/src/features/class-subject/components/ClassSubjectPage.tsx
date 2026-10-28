import { useMemo, useState } from "react";
import { BookOpen, Edit2, Plus, Search, Trash2, Users, GraduationCap, AlertCircle, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useClassSubjectOptions, useClassSubjects, useCreateClassSubject, useDeleteClassSubject, useUpdateClassSubject } from "../hooks/useClassSubjects";
import type { ClassSubject } from "../types";
import type { ClassSubjectFormValues } from "../schemas/classSubjectSchema";
import { ClassSubjectDialog } from "./ClassSubjectDialog";
import { DeleteClassSubjectDialog } from "./DeleteClassSubjectDialog";
import { academicYearQueryId, filterAcademicYears, pageAfterDelete, type AcademicYearFilter } from "../utils";

function errorMessage(error: unknown): string { return error instanceof ApiError ? error.message : error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi."; }
const DUPLICATE_MESSAGE = "Mata pelajaran ini sudah terdaftar di kelas dan tahun ajaran tersebut.";
const DELETE_CONFLICT_MESSAGE = "Mata pelajaran kelas tidak dapat dihapus karena masih digunakan oleh jadwal, modul, ujian, atau nilai.";

export function ClassSubjectPage() {
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState<AcademicYearFilter>("default");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dialogItem, setDialogItem] = useState<ClassSubject | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<ClassSubject | null>(null);
  const [serverError, setServerError] = useState<{ field: string; message: string } | null>(null);
  const debouncedSearch = useDebounce(search);
  const optionsQuery = useClassSubjectOptions();
  const { profile } = useProfile();
  const scopedOptions = useMemo(() => {
    if (!optionsQuery.data) return undefined;
    return {
      ...optionsQuery.data,
      academicYears: filterAcademicYears(optionsQuery.data.academicYears, profile?.institutionId),
    };
  }, [optionsQuery.data, profile?.institutionId]);
  const activeAcademicYearId = scopedOptions?.academicYears.find((year) => year.is_active)?.id;
  const effectiveAcademicYearId = academicYearQueryId(academicYearFilter, activeAcademicYearId);
  const listQuery = useClassSubjects({ page, limit, search: debouncedSearch, class_id: classId, academic_year_id: effectiveAcademicYearId });
  const createMutation = useCreateClassSubject();
  const updateMutation = useUpdateClassSubject();
  const deleteMutation = useDeleteClassSubject();
  const rows = useMemo(() => listQuery.data?.data ?? [], [listQuery.data?.data]);
  const meta = listQuery.data?.meta ?? { totalData: 0, totalPages: 0, currentPage: page, perPage: limit };
  const stats = useMemo(() => ({ total: rows.length, classes: new Set(rows.map((row) => row.class_id)).size, subjects: new Set(rows.map((row) => row.subject_id)).size, teachers: new Set(rows.map((row) => row.teacher_id)).size }), [rows]);
  const statCards: { label: string; value: number; icon: LucideIcon }[] = [
    { label: "TOTAL MAPEL KELAS", value: stats.total, icon: BookOpen },
    { label: "KELAS TERHUBUNG", value: stats.classes, icon: GraduationCap },
    { label: "MATA PELAJARAN", value: stats.subjects, icon: BookOpen },
    { label: "GURU PENGAMPU", value: stats.teachers, icon: Users },
  ];

  const openCreate = () => { setServerError(null); setDialogItem(null); };
  const openEdit = (item: ClassSubject) => { setServerError(null); setDialogItem(item); };
  const handleSave = async (values: ClassSubjectFormValues) => {
    setServerError(null);
    try {
      if (dialogItem) await updateMutation.mutateAsync({ id: dialogItem.id, input: values }); else await createMutation.mutateAsync(values);
      setDialogItem(undefined); toast.success(dialogItem ? "Mata pelajaran kelas berhasil diperbarui." : "Mata pelajaran kelas berhasil ditambahkan.");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setServerError({ field: "academic_year_id", message: DUPLICATE_MESSAGE });
      } else if (error instanceof ApiError && error.status === 422 && error.fieldErrors[0]) {
        setServerError(error.fieldErrors[0]);
      } else {
        toast.error(errorMessage(error));
      }
    }
  };
  const handleDelete = async () => { if (!deleting) return; try { await deleteMutation.mutateAsync(deleting.id); setDeleting(null); setPage((currentPage) => pageAfterDelete(currentPage, rows.length - 1)); toast.success("Mata pelajaran kelas berhasil dihapus."); } catch (error) { toast.error(error instanceof ApiError && error.status === 409 ? DELETE_CONFLICT_MESSAGE : errorMessage(error)); } };
  const teacherName = (row: ClassSubject) => row.teacher?.profile?.fullName ?? row.teacher?.teacher_number ?? "-";

  return <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-[#0f172a] dark:text-slate-50 sm:p-6"><div className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400"><BookOpen className="size-5" /><span className="text-xs font-bold uppercase tracking-wider">Konfigurasi Akademik</span></div><h1 className="text-2xl font-bold tracking-tight">Mata Pelajaran Kelas</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Atur mata pelajaran, guru pengampu, dan tahun ajaran untuk setiap kelas.</p></div><Button type="button" onClick={openCreate} className="bg-blue-700 font-semibold text-white hover:bg-blue-800"><Plus className="size-4" /> Tambah Mata Pelajaran</Button></div>
     <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[minmax(0,1fr)_220px_220px]"><label className="relative"><span className="sr-only">Cari mata pelajaran kelas</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Cari kelas, mata pelajaran, atau guru..." className="h-10 pl-9" /></label><label><span className="sr-only">Filter kelas</span><Select value={classId} onChange={(event) => { setClassId(event.target.value); setPage(1); }} className="h-10"><option value="">Semua kelas</option>{optionsQuery.data?.classes.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</Select></label><label><span className="sr-only">Filter tahun ajaran</span><Select value={academicYearFilter === "default" ? activeAcademicYearId ?? "" : academicYearFilter === "all" ? "" : academicYearFilter} onChange={(event) => { setAcademicYearFilter(event.target.value || "all"); setPage(1); }} className="h-10"><option value="">Semua tahun ajaran</option>{scopedOptions?.academicYears.map((option) => <option key={option.id} value={option.id}>{option.academic_year}</option>)}</Select></label></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{statCards.map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400"><Icon className="size-5" /></div><div><p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p><p className="text-2xl font-bold">{listQuery.isPending ? "..." : value}</p><p className="text-[11px] text-slate-400">di halaman ini</p></div></div>)}</div>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">{listQuery.isPending ? <div className="space-y-3 p-6">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />)}</div> : listQuery.isError ? <div className="p-12 text-center text-red-600 dark:text-red-400"><AlertCircle className="mx-auto mb-2 size-8" /><p className="font-semibold">Gagal memuat data mata pelajaran kelas</p><Button variant="outline" className="mt-3" onClick={() => void listQuery.refetch()}>Coba lagi</Button></div> : rows.length === 0 ? <div className="p-12 text-center text-slate-500 dark:text-slate-400"><BookOpen className="mx-auto mb-3 size-12 opacity-40" /><p className="font-semibold">Belum ada data mata pelajaran kelas</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400"><tr><th className="px-5 py-3.5">Kelas</th><th className="px-5 py-3.5">Mata Pelajaran</th><th className="px-5 py-3.5">Guru Pengampu</th><th className="px-5 py-3.5">Tahun Ajaran</th><th className="px-5 py-3.5 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">{rows.map((row) => <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40"><td className="px-5 py-4 font-semibold">{row.class?.name ?? "-"}</td><td className="px-5 py-4"><span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">{row.subject?.name ?? "-"}</span></td><td className="px-5 py-4 text-slate-600 dark:text-slate-300">{teacherName(row)}</td><td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.academic_year?.academic_year ?? "-"}</td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => openEdit(row)}><Edit2 className="size-3.5" />Ubah</Button><Button variant="outline" size="sm" onClick={() => setDeleting(row)} className="text-red-600 dark:text-red-400"><Trash2 className="size-3.5" />Hapus</Button></div></td></tr>)}</tbody></table><div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">Menampilkan {rows.length} dari {meta.totalData} data</div></div>}</div>
    {meta.totalPages > 0 && <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row"><label className="flex items-center gap-2 text-sm text-slate-500">Per halaman<Select value={String(limit)} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }} className="w-auto"><option value="10">10</option><option value="25">25</option><option value="50">50</option></Select></label><div className="flex items-center gap-3"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Sebelumnya</Button><span className="text-sm text-slate-500">Halaman {meta.currentPage} dari {Math.max(meta.totalPages, 1)}</span><Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((value) => value + 1)}>Berikutnya</Button></div></div>}
  </div><ClassSubjectDialog open={dialogItem !== undefined} item={dialogItem} options={scopedOptions} isSaving={createMutation.isPending || updateMutation.isPending} serverError={serverError} onFieldChange={() => setServerError(null)} onClose={() => setDialogItem(undefined)} onSave={handleSave} /><DeleteClassSubjectDialog item={deleting} isDeleting={deleteMutation.isPending} onClose={() => setDeleting(null)} onConfirm={handleDelete} /></main>;
}
