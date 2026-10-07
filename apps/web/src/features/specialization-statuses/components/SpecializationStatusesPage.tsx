import { useMemo, useState } from 'react';
import { SpecializationStatusHeader } from './SpecializationStatusHeader';
import { SpecializationStatusStats } from './SpecializationStatusStats';
import { DeleteSpecializationStatusDialog } from './DeleteSpecializationStatusDialog';
import { SpecializationStatusDialog } from './SpecializationStatusDialog';
import { SpecializationStatusesTable } from './SpecializationStatusesTable';
import {
  useSpecializationStatuses,
  useCreateSpecializationStatus,
  useDeleteSpecializationStatus,
  useUpdateSpecializationStatus,
} from '../hooks/useSpecializationStatuses';
import type { SpecializationStatus } from '../types';
import type { SpecializationStatusFormValues } from '../schemas/specializationStatusSchema';

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan. Silakan coba lagi.';
}

export function SpecializationStatusesPage() {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<SpecializationStatus | null>(null);
  const [deletingItem, setDeletingItem] = useState<SpecializationStatus | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const specializationStatusesQuery = useSpecializationStatuses();
  const createMutation = useCreateSpecializationStatus();
  const updateMutation = useUpdateSpecializationStatus();
  const deleteMutation = useDeleteSpecializationStatus();

  const specializationStatuses = useMemo(
    () => specializationStatusesQuery.data ?? [],
    [specializationStatusesQuery.data],
  );

  const handleCreate = async (values: SpecializationStatusFormValues) => {
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

  const handleUpdate = async (values: SpecializationStatusFormValues) => {
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
        <SpecializationStatusHeader onAdd={() => setIsAdding(true)} />

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

        {specializationStatusesQuery.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {errorMessage(specializationStatusesQuery.error)}
          </div>
        )}

        <SpecializationStatusStats statuses={specializationStatuses} isLoading={specializationStatusesQuery.isPending} />

        <SpecializationStatusesTable
          specializationStatuses={specializationStatuses}
          isLoading={specializationStatusesQuery.isPending}
          search={search}
          onSearchChange={setSearch}
          onEdit={(item) => setEditingItem(item)}
          onDelete={(item) => setDeletingItem(item)}
        />
      </div>

      {isAdding && (
        <SpecializationStatusDialog
          open={isAdding}
          isSaving={createMutation.isPending}
          onClose={() => setIsAdding(false)}
          onSave={handleCreate}
        />
      )}

      {editingItem && (
        <SpecializationStatusDialog
          open={Boolean(editingItem)}
          specializationStatus={editingItem}
          isSaving={updateMutation.isPending}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdate}
        />
      )}

      {deletingItem && (
        <DeleteSpecializationStatusDialog
          specializationStatus={deletingItem}
          isDeleting={deleteMutation.isPending}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  );
}
