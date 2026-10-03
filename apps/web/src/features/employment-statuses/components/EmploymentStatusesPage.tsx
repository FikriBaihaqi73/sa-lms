import { useMemo, useState } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteEmploymentStatusDialog } from './DeleteEmploymentStatusDialog';
import { EmploymentStatusDialog } from './EmploymentStatusDialog';
import { EmploymentStatusesTable } from './EmploymentStatusesTable';
import {
  useCreateEmploymentStatus,
  useDeleteEmploymentStatus,
  useEmploymentStatuses,
  useUpdateEmploymentStatus,
} from '../hooks/useEmploymentStatuses';
import type { EmploymentStatus } from '../types';
import type { EmploymentStatusFormValues } from '../schemas/employmentStatusSchema';

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan. Silakan coba lagi.';
}

export function EmploymentStatusesPage() {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<EmploymentStatus | null>(null);
  const [deletingItem, setDeletingItem] = useState<EmploymentStatus | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const employmentStatusesQuery = useEmploymentStatuses();
  const createMutation = useCreateEmploymentStatus();
  const updateMutation = useUpdateEmploymentStatus();
  const deleteMutation = useDeleteEmploymentStatus();

  const employmentStatuses = useMemo(
    () => employmentStatusesQuery.data ?? [],
    [employmentStatusesQuery.data],
  );

  const handleCreate = async (values: EmploymentStatusFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        description: values.description || undefined,
      });
      setIsAdding(false);
      setNotice({ kind: 'success', message: 'Status kepegawaian berhasil ditambahkan.' });
      employmentStatusesQuery.refresh();
    } catch (err) {
      setNotice({ kind: 'error', message: errorMessage(err) });
    }
  };

  const handleUpdate = async (values: EmploymentStatusFormValues) => {
    if (!editingItem) return;
    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        input: {
          name: values.name,
          description: values.description || undefined,
        },
      });
      setEditingItem(null);
      setNotice({ kind: 'success', message: 'Status kepegawaian berhasil diperbarui.' });
      employmentStatusesQuery.refresh();
    } catch (err) {
      setNotice({ kind: 'error', message: errorMessage(err) });
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteMutation.mutateAsync(deletingItem.id);
      setDeletingItem(null);
      setNotice({ kind: 'success', message: 'Status kepegawaian berhasil dihapus.' });
      employmentStatusesQuery.refresh();
    } catch (err) {
      setNotice({ kind: 'error', message: errorMessage(err) });
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
              <ShieldCheck className="size-3.5" /> Superadmin Portal
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Status Kepegawaian (Employment Status)
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Kelola master data status kepegawaian referensi untuk profil dosen dan tenaga kependidikan.
            </p>
          </div>
          <Button
            onClick={() => setIsAdding(true)}
            className="h-10 bg-blue-700 px-4 text-sm font-semibold hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Plus className="size-4 mr-1.5" /> Tambah Status
          </Button>
        </header>

        {/* Notice banner */}
        {notice && (
          <div
            className={`flex items-center justify-between rounded-lg p-4 text-sm font-medium shadow-sm ${
              notice.kind === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
                : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300'
            }`}
          >
            <span>{notice.message}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-xs font-semibold hover:underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Error message */}
        {employmentStatusesQuery.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {errorMessage(employmentStatusesQuery.error)}
          </div>
        )}

        {/* Main Table View */}
        <EmploymentStatusesTable
          employmentStatuses={employmentStatuses}
          isLoading={employmentStatusesQuery.isPending}
          search={search}
          onSearchChange={setSearch}
          onEdit={(item) => setEditingItem(item)}
          onDelete={(item) => setDeletingItem(item)}
        />
      </div>

      {/* Add Modal */}
      {isAdding && (
        <EmploymentStatusDialog
          open={isAdding}
          isSaving={createMutation.isPending}
          onClose={() => setIsAdding(false)}
          onSave={handleCreate}
        />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <EmploymentStatusDialog
          open={Boolean(editingItem)}
          employmentStatus={editingItem}
          isSaving={updateMutation.isPending}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdate}
        />
      )}

      {/* Delete Modal */}
      {deletingItem && (
        <DeleteEmploymentStatusDialog
          employmentStatus={deletingItem}
          isDeleting={deleteMutation.isPending}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  );
}
