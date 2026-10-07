import { useDeferredValue, useEffect, useState } from "react";
import { useAcademicStatuses } from "@/features/academic-statuses/hooks/useAcademicStatuses";
import { DeleteStudentDialog } from "./DeleteStudentDialog";
import { StudentDialog } from "./StudentDialog";
import { StudentHeader } from "./StudentHeader";
import { StudentStats } from "./StudentStats";
import { StudentsTable } from "./StudentsTable";
import { useCreateStudent, useDeleteStudent, useStudentDepartments, useStudentProfiles, useStudents, useUpdateStudent } from "../hooks/useStudents";
import type { Student } from "../types";
import type { StudentFormValues } from "../schemas/studentSchema";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
}

export function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const studentsQuery = useStudents({ page: currentPage, limit, search: deferredSearch.trim() });
  const profilesQuery = useStudentProfiles();
  const departmentsQuery = useStudentDepartments();
  const academicStatusesQuery = useAcademicStatuses();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();
  const studentsPage = studentsQuery.data;
  const students = studentsPage?.data ?? [];
  const meta = studentsPage?.meta;
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function handleSave(values: StudentFormValues) {
    try {
      const base = {
        academicStatusId: values.academicStatusId,
        studentNumber: values.studentNumber.trim(),
        ...(values.departmentId ? { departmentId: values.departmentId } : {}),
        ...(values.enrollmentYear !== undefined ? { enrollmentYear: values.enrollmentYear } : {}),
      };
      if (editingStudent) {
        await updateMutation.mutateAsync({ id: editingStudent.id, input: base });
        setNotice({ kind: "success", message: "Student berhasil diperbarui." });
      } else {
        await createMutation.mutateAsync({ profileId: values.profileId, ...base });
        setNotice({ kind: "success", message: "Student berhasil dibuat." });
      }
      setIsDialogOpen(false);
      setEditingStudent(null);
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error) });
    }
  }

  async function handleConfirmDelete() {
    if (!deletingStudent) return;
    try {
      await deleteMutation.mutateAsync(deletingStudent.id);
      setNotice({ kind: "success", message: "Student berhasil dihapus." });
      setDeletingStudent(null);
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error) });
    }
  }

  return <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl space-y-6">
    {notice && <div role="status" className={`rounded-lg border p-4 text-sm font-medium shadow-sm ${notice.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"}`}>{notice.message}</div>}
    <StudentHeader searchTerm={searchTerm} onSearchChange={(value) => { setSearchTerm(value); setCurrentPage(1); }} onOpenCreate={() => { setEditingStudent(null); setIsDialogOpen(true); }} />
    <StudentStats meta={meta} visibleCount={students.length} isLoading={studentsQuery.isPending} />
    <StudentsTable students={students} departments={departmentsQuery.data?.data ?? []} academicStatuses={academicStatusesQuery.data ?? []} isLoading={studentsQuery.isPending} isError={studentsQuery.isError} searchTerm={deferredSearch.trim()} total={meta?.total ?? 0} onEdit={(student) => { setEditingStudent(student); setIsDialogOpen(true); }} onDelete={setDeletingStudent} />
    {!studentsQuery.isPending && !studentsQuery.isError && meta && meta.totalPages > 0 && <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row"><label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">Per halaman<select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></label><div className="flex items-center gap-3"><button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage <= 1} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Previous</button><span className="text-sm text-slate-600 dark:text-slate-400">Page {meta.page} of {totalPages}</span><button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage >= totalPages} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Next</button></div></div>}
  </div><StudentDialog open={isDialogOpen} student={editingStudent} profiles={profilesQuery.data?.data ?? []} departments={departmentsQuery.data?.data ?? []} academicStatuses={academicStatusesQuery.data ?? []} isSaving={createMutation.isPending || updateMutation.isPending} onClose={() => { setIsDialogOpen(false); setEditingStudent(null); }} onSave={handleSave} /><DeleteStudentDialog student={deletingStudent} isDeleting={deleteMutation.isPending} onClose={() => setDeletingStudent(null)} onConfirm={handleConfirmDelete} /></main>;
}

