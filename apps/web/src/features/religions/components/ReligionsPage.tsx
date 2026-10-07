import { useDeferredValue, useEffect, useState } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteReligionDialog } from './DeleteReligionDialog';
import { ReligionDialog } from './ReligionDialog';
import { ReligionsTable } from './ReligionsTable';
import {
  useCreateReligion,
  useDeleteReligion,
  useReligions,
  useUpdateReligion,
} from '../hooks/useReligions';
import type { Religion } from '../types';
import type { ReligionFormValues } from '../schemas/religionSchema';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.';
}

export function ReligionsPage() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isAdding, setIsAdding] = useState(false);
  const [editingReligion, setEditingReligion] = useState<Religion | null>(null);
  const [deletingReligion, setDeletingReligion] = useState<Religion | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const normalizedSearch = deferredSearch.trim();
  const religionsQuery = useReligions({ page: currentPage, limit, search: normalizedSearch });
  const createMutation = useCreateReligion();
  const updateMutation = useUpdateReligion();
  const deleteMutation = useDeleteReligion();
  const religionsPage = religionsQuery.data;
  const religions = religionsPage?.data ?? [];
  const meta = religionsPage?.meta;
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const handleCreate = async (values: ReligionFormValues) => {
    try {
      await createMutation.mutateAsync({ name: values.name });
      setIsAdding(false);
      setNotice({ kind: 'success', message: `Religion '${values.name}' berhasil ditambahkan.` });
    } catch (error) {
      setNotice({ kind: 'error', message: errorMessage(error) });
    }
  };

  const handleUpdate = async (values: ReligionFormValues) => {
    if (!editingReligion) return;
    try {
      await updateMutation.mutateAsync({ id: editingReligion.id, input: { name: values.name } });
      setEditingReligion(null);
      setNotice({ kind: 'success', message: `Religion '${values.name}' berhasil diperbarui.` });
    } catch (error) {
      setNotice({ kind: 'error', message: errorMessage(error) });
    }
  };

  const handleDelete = async () => {
    if (!deletingReligion) return;
    try {
      await deleteMutation.mutateAsync(deletingReligion.id);
      if (religions.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      }
      setDeletingReligion(null);
      setNotice({ kind: 'success', message: `Religion '${deletingReligion.name}' berhasil disembunyikan.` });
    } catch (error) {
      setNotice({ kind: 'error', message: errorMessage(error) });
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400"><ShieldCheck className="size-3.5" />Settings Portal</span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Religion Management</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola master data agama sebagai referensi untuk profil pengguna dan kebutuhan akademik.</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="h-10 bg-blue-700 px-4 text-sm font-semibold hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"><Plus className="mr-1.5 size-4" />Tambah Religion</Button>
        </header>

        {notice && <div role="status" className={`fixed right-4 top-4 z-[60] rounded-xl border p-4 text-sm font-medium text-white shadow-lg ${notice.kind === 'success' ? 'border-emerald-500 bg-emerald-600' : 'border-red-500 bg-red-600'}`}>{notice.message}</div>}
        {religionsQuery.isError && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">{errorMessage(religionsQuery.error)}</div>}

        <ReligionsTable religions={religions} meta={meta} isLoading={religionsQuery.isPending} isError={religionsQuery.isError} search={search} onSearchChange={(value) => { setSearch(value); setCurrentPage(1); }} onEdit={setEditingReligion} onDelete={setDeletingReligion} />

        {!religionsQuery.isPending && !religionsQuery.isError && meta && meta.totalPages > 0 && <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row"><label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">Per halaman<select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></label><div className="flex items-center gap-3"><button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage <= 1 || religionsQuery.isFetching} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Previous</button><span className="text-sm text-slate-600 dark:text-slate-400">Page {meta.page} of {totalPages}</span><button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage >= totalPages || religionsQuery.isFetching} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Next</button></div></div>}
      </div>

      {isAdding && <ReligionDialog open={isAdding} isSaving={createMutation.isPending} onClose={() => setIsAdding(false)} onSave={handleCreate} />}
      {editingReligion && <ReligionDialog open={Boolean(editingReligion)} religion={editingReligion} isSaving={updateMutation.isPending} onClose={() => setEditingReligion(null)} onSave={handleUpdate} />}
      {deletingReligion && <DeleteReligionDialog religion={deletingReligion} isDeleting={deleteMutation.isPending} onClose={() => setDeletingReligion(null)} onConfirm={handleDelete} />}
    </main>
  );
}
