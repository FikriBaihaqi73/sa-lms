import { useMemo, useState } from 'react';
import { AcademicStatusHeader } from './AcademicStatusHeader';
import { AcademicStatusStats } from './AcademicStatusStats';
import { DeleteAcademicStatusDialog } from './DeleteAcademicStatusDialog';
import { AcademicStatusDialog } from './AcademicStatusDialog';
import { AcademicStatusesTable } from './AcademicStatusesTable';
import {
  useAcademicStatuses,
  useCreateAcademicStatus,
  useDeleteAcademicStatus,
  useUpdateAcademicStatus,
} from '../hooks/useAcademicStatuses';
import type { AcademicStatus } from '../types';
import type { AcademicStatusFormValues } from '../schemas/academicStatusSchema';

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan. Silakan coba lagi.';
}

export function AcademicStatusesPage() {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicStatus | null>(null);
  const [deletingItem, setDeletingItem] = useState<AcademicStatus | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const academicStatusesQuery = useAcademicStatuses();
  const createMutation = useCreateAcademicStatus();
  const updateMutation = useUpdateAcademicStatus();
  const deleteMutation = useDeleteAcademicStatus();

  const academicStatuses = useMemo(
    () => academicStatusesQuery.data ?? [],
    [academicStatusesQuery.data],
  );

  const handleCreate = async (values: AcademicStatusFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        description: values.description || undefined,
      });
      setIsAdding(false);
      setNotice({ kind: 'success', message: 'Status akademik berhasil ditambahkan.' });
    } catch (err) {
      setNotice({ kind: 'error', message: errorMessage(err) });
    }
  };

  const handleUpdate = async (values: AcademicStatusFormValues) => {
    if (!editingItem) return;
    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        input: { name: values.name, description: values.description || undefined },
      });
      setEditingItem(null);
      setNotice({ kind: 'success', message: 'Status akademik berhasil diperbarui.' });
    } catch (err) {
      setNotice({ kind: 'error', message: errorMessage(err) });
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteMutation.mutateAsync(deletingItem.id);
      setDeletingItem(null);
      setNotice({ kind: 'success', message: 'Status akademik berhasil dihapus.' });
    } catch (err) {
      setNotice({ kind: 'error', message: errorMessage(err) });
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <AcademicStatusHeader onAdd={() => setIsAdding(true)} />

        {notice && (
          <div
            className={`flex items-center justify-between rounded-lg p-4 text-sm font-medium shadow-sm ${
              notice.kind === 'success'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
            }`}
          >
            <span>{notice.message}</span>
            <button type="button" onClick={() => setNotice(null)} className="text-xs font-semibold hover:underline">
              Tutup
            </button>
          </div>
        )}

        {academicStatusesQuery.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {errorMessage(academicStatusesQuery.error)}
          </div>
        )}

        <AcademicStatusStats statuses={academicStatuses} isLoading={academicStatusesQuery.isPending} />

        <AcademicStatusesTable
          academicStatuses={academicStatuses}
          isLoading={academicStatusesQuery.isPending}
          search={search}
          onSearchChange={setSearch}
          onEdit={(item) => setEditingItem(item)}
          onDelete={(item) => setDeletingItem(item)}
        />
      </div>

      {isAdding && (
        <AcademicStatusDialog
          open={isAdding}
          isSaving={createMutation.isPending}
          onClose={() => setIsAdding(false)}
          onSave={handleCreate}
        />
      )}

      {editingItem && (
        <AcademicStatusDialog
          open={Boolean(editingItem)}
          academicStatus={editingItem}
          isSaving={updateMutation.isPending}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdate}
        />
      )}

      {deletingItem && (
        <DeleteAcademicStatusDialog
          academicStatus={deletingItem}
          isDeleting={deleteMutation.isPending}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  );
}
