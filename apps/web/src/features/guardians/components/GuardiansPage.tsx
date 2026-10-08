import { useDeferredValue, useEffect, useState } from "react";
import { HeartHandshake, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteGuardianDialog } from "./DeleteGuardianDialog";
import { GuardianDialog } from "./GuardianDialog";
import { GuardiansTable } from "./GuardiansTable";
import {
  useCreateGuardian,
  useDeleteGuardian,
  useGuardians,
  useUpdateGuardian,
} from "../hooks/useGuardians";
import type { GuardianFormValues } from "../schemas/guardianSchema";
import type { Guardian } from "../types";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
}

export function GuardiansPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isAdding, setIsAdding] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [deletingGuardian, setDeletingGuardian] = useState<Guardian | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const normalizedSearch = deferredSearch.trim();
  const guardiansQuery = useGuardians({ page: currentPage, limit, search: normalizedSearch });
  const createMutation = useCreateGuardian();
  const updateMutation = useUpdateGuardian();
  const deleteMutation = useDeleteGuardian();
  const guardiansPage = guardiansQuery.data;
  const guardians = guardiansPage?.data ?? [];
  const meta = guardiansPage?.meta;
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const toInput = (values: GuardianFormValues) => ({
    fullName: values.fullName.trim(),
    relationship: values.relationship?.trim() || undefined,
    phoneNumber: values.phoneNumber?.trim() || undefined,
    email: values.email?.trim() || undefined,
    address: values.address?.trim() || undefined,
    occupation: values.occupation?.trim() || undefined,
  });

  const handleCreate = async (values: GuardianFormValues) => {
    try {
      await createMutation.mutateAsync(toInput(values));
      setIsAdding(false);
      setNotice({ kind: "success", message: `Guardian '${values.fullName}' berhasil ditambahkan.` });
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error) });
    }
  };

  const handleUpdate = async (values: GuardianFormValues) => {
    if (!editingGuardian) return;
    try {
      await updateMutation.mutateAsync({ id: editingGuardian.id, input: toInput(values) });
      setEditingGuardian(null);
      setNotice({ kind: "success", message: `Guardian '${values.fullName}' berhasil diperbarui.` });
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error) });
    }
  };

  const handleDelete = async () => {
    if (!deletingGuardian) return;
    try {
      await deleteMutation.mutateAsync(deletingGuardian.id);
      if (guardians.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      }
      setDeletingGuardian(null);
      setNotice({ kind: "success", message: `Guardian '${deletingGuardian.fullName}' berhasil disembunyikan.` });
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error) });
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400"><HeartHandshake className="size-3.5" />Institution Portal</span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Guardian Management</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola data wali murid (guardian) sebagai pendamping resmi siswa di institusi Anda.</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="h-10 bg-blue-700 px-4 text-sm font-semibold hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"><Plus className="mr-1.5 size-4" />Tambah Guardian</Button>
        </header>

        {notice && <div role="status" className={`fixed right-4 top-4 z-[60] rounded-xl border p-4 text-sm font-medium text-white shadow-lg ${notice.kind === "success" ? "border-emerald-500 bg-emerald-600" : "border-red-500 bg-red-600"}`}>{notice.message}</div>}
        {guardiansQuery.isError && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">{errorMessage(guardiansQuery.error)}</div>}

        <GuardiansTable guardians={guardians} meta={meta} isLoading={guardiansQuery.isPending} isError={guardiansQuery.isError} search={search} onSearchChange={(value) => { setSearch(value); setCurrentPage(1); }} onEdit={setEditingGuardian} onDelete={setDeletingGuardian} />

        {!guardiansQuery.isPending && !guardiansQuery.isError && meta && meta.totalPages > 0 && <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row"><label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">Per halaman<select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></label><div className="flex items-center gap-3"><button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage <= 1 || guardiansQuery.isFetching} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Previous</button><span className="text-sm text-slate-600 dark:text-slate-400">Page {meta.page} of {totalPages}</span><button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage >= totalPages || guardiansQuery.isFetching} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Next</button></div></div>}
      </div>

      {isAdding && <GuardianDialog open={isAdding} isSaving={createMutation.isPending} onClose={() => setIsAdding(false)} onSave={handleCreate} />}
      {editingGuardian && <GuardianDialog open={Boolean(editingGuardian)} guardian={editingGuardian} isSaving={updateMutation.isPending} onClose={() => setEditingGuardian(null)} onSave={handleUpdate} />}
      {deletingGuardian && <DeleteGuardianDialog guardian={deletingGuardian} isDeleting={deleteMutation.isPending} onClose={() => setDeletingGuardian(null)} onConfirm={handleDelete} />}
    </main>
  );
}
