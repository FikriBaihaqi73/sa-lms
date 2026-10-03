import { useMemo, useState } from "react";
import { Download, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradesFilterBar } from "./GradesFilterBar";
import { GradesStats } from "./GradesStats";
import { GradesTable } from "./GradesTable";
import { EditGradeDialog } from "./EditGradeDialog";
import { useGrades, useUpdateGrade } from "../hooks/useGrades";
import { calcFinalScore, gradeStatus } from "../types";
import type { GradeRow, UpdateGradeInput } from "../types";

const CLASS_OPTIONS = ["Semua Kelas", "Kelas 7A", "Kelas 7B", "Kelas 8A", "Kelas 9A"];
const SUBJECT_OPTIONS = ["Semua Mapel", "Matematika", "IPA", "Bahasa Indonesia", "Bahasa Inggris"];
const SEMESTER_OPTIONS = ["Semester Ganjil", "Semester Genap"];

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan. Silakan coba lagi.";
}
export function GradesPage() {
  const [classFilter, setClassFilter] = useState("Semua Kelas");
  const [subjectFilter, setSubjectFilter] = useState("Semua Mapel");
  const [semesterFilter, setSemesterFilter] = useState("Semester Ganjil");
  const [search, setSearch] = useState("");
  const [editingRow, setEditingRow] = useState<GradeRow | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const gradesQuery = useGrades("");
  const updateMutation = useUpdateGrade();
  const grades = useMemo(() => gradesQuery.data ?? [], [gradesQuery.data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return grades.filter((row) => {
      const mc = classFilter === "Semua Kelas" || row.className === classFilter;
      const ms = subjectFilter === "Semua Mapel" || row.subjectName === subjectFilter;
      const mm = row.semester === semesterFilter;
      const mq = !q || row.studentName.toLowerCase().includes(q) || row.studentNumber.toLowerCase().includes(q) || row.subjectCode.toLowerCase().includes(q) || row.subjectName.toLowerCase().includes(q);
      return mc && ms && mm && mq;
    });
  }, [grades, classFilter, subjectFilter, semesterFilter, search]);
  const stats = useMemo(() => {
    const finals = filtered.map((r) => calcFinalScore(r)).filter((v): v is number => v !== null);
    const avg = finals.length > 0 ? finals.reduce((a, b) => a + b, 0) / finals.length : 0;
    const passed = filtered.filter((r) => gradeStatus(calcFinalScore(r)) === "Lulus").length;
    const remedial = filtered.filter((r) => gradeStatus(calcFinalScore(r)) === "Remedial").length;
    return { total: filtered.length, average: avg, passed, remedial };
  }, [filtered]);
  const handleSave = async (input: UpdateGradeInput) => {
    if (!editingRow) return;
    try {
      await updateMutation.mutateAsync({ id: editingRow.id, input });
      setEditingRow(null);
      setNotice({ kind: "success", message: `Nilai ${editingRow.studentName} berhasil diperbarui.` });
    } catch (err) {
      setNotice({ kind: "error", message: errorMessage(err) });
    }
  };
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
              <GraduationCap className="size-3.5" /> Portal Akademik
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Manajemen Nilai (Grades)</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola nilai tugas, UTS, dan UAS siswa per kelas dan mata pelajaran. Bobot: Tugas 30%, UTS 30%, UAS 40%. KKM 70.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className="h-10 border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <Download className="size-4" /> Export
            </Button>
          </div>
        </header>
        {notice && (
          <div role="status" className={`flex items-center justify-between rounded-lg border p-4 text-sm font-medium shadow-sm ${notice.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"}`}>
            <span>{notice.message}</span>
            <button type="button" onClick={() => setNotice(null)} className="text-xs font-semibold hover:underline">Tutup</button>
          </div>
        )}
        {gradesQuery.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">{errorMessage(gradesQuery.error)}</div>
        )}
        <GradesStats total={stats.total} average={stats.average} passed={stats.passed} remedial={stats.remedial} isLoading={gradesQuery.isPending} />
        <GradesFilterBar classFilter={classFilter} subjectFilter={subjectFilter} semesterFilter={semesterFilter} search={search} classOptions={CLASS_OPTIONS} subjectOptions={SUBJECT_OPTIONS} semesterOptions={SEMESTER_OPTIONS} onClassChange={setClassFilter} onSubjectChange={setSubjectFilter} onSemesterChange={setSemesterFilter} onSearchChange={setSearch} />
        <GradesTable rows={filtered} totalCount={grades.length} isLoading={gradesQuery.isPending} onEdit={setEditingRow} />
      </div>
      {editingRow && (<EditGradeDialog row={editingRow} isSaving={updateMutation.isPending} onClose={() => setEditingRow(null)} onSave={handleSave} />)}
    </main>
  );
}
