import { useDeferredValue, useEffect, useState } from 'react';
import { AttendanceStatusHeader } from './AttendanceStatusHeader';
import { AttendanceStatusStats } from './AttendanceStatusStats';
import { AttendanceStatusesTable } from './AttendanceStatusesTable';
import { AttendanceStatusDialog } from './AttendanceStatusDialog';
import { DeleteAttendanceStatusDialog } from './DeleteAttendanceStatusDialog';
import {
  useAttendanceStatuses,
  useCreateAttendanceStatus,
  useDeleteAttendanceStatus,
  useUpdateAttendanceStatus,
} from '../hooks/useAttendanceStatuses';
import type { AttendanceStatus } from '../types';
import type { AttendanceStatusFormValues } from '../schemas/attendanceStatusSchema';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.';
}

export function AttendanceStatusesPage() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<AttendanceStatus | null>(null);
  const [deletingItem, setDeletingItem] = useState<AttendanceStatus | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const normalizedSearch = deferredSearch.trim();
  const statusesQuery = useAttendanceStatuses({ page: currentPage, limit, search: normalizedSearch });
  const createMutation = useCreateAttendanceStatus();
  const updateMutation = useUpdateAttendanceStatus();
  const deleteMutation = useDeleteAttendanceStatus();
  const statusesPage = statusesQuery.data;
  const statuses = statusesPage?.data ?? [];
  const meta = statusesPage?.meta;

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const handleCreate = async (values: AttendanceStatusFormValues) => {
    try {
      await createMutation.mutateAsync({ name: values.name, description: values.description || undefined });
      setIsAdding(false);
      setNotice({ kind: 'success', message: 'Attendance status berhasil ditambahkan.' });
    } catch (error) {
      setNotice({ kind: 'error', message: errorMessage(error) });
    }
  };

  const handleUpdate = async (values: AttendanceStatusFormValues) => {
    if (!editingItem) return;
    try {
      await updateMutation.mutateAsync({ id: editingItem.id, input: { name: values.name, description: values.description || undefined } });
      setEditingItem(null);
      setNotice({ kind: 'success', message: 'Attendance status berhasil diperbarui.' });
    } catch (error) {
      setNotice({ kind: 'error', message: errorMessage(error) });
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteMutation.mutateAsync(deletingItem.id);
      if (statuses.length === 1 && currentPage > 1) setCurrentPage((page) => page - 1);
      setDeletingItem(null);
      setNotice({ kind: 'success', message: 'Attendance status berhasil dihapus.' });
    } catch (error) {
      setNotice({ kind: 'error', message: errorMessage(error) });
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <AttendanceStatusHeader onAdd={() => setIsAdding(true)} />
        {notice && <div role="status" className={`fixed right-4 top-4 z-[60] rounded-xl border p-4 text-sm font-medium text-white shadow-lg ${notice.kind === 'success' ? 'border-emerald-500 bg-emerald-600' : 'border-red-500 bg-red-600'}`}>{notice.message}</div>}
        {statusesQuery.isError && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">{errorMessage(statusesQuery.error)}</div>}
        <AttendanceStatusStats total={meta?.total ?? 0} isLoading={statusesQuery.isPending} />
        <AttendanceStatusesTable
          attendanceStatuses={statuses}
          meta={meta}
          isLoading={statusesQuery.isPending}
          isFetching={statusesQuery.isFetching}
          search={search}
          onSearchChange={(value) => { setSearch(value); setCurrentPage(1); }}
          onPageChange={(page) => setCurrentPage(Math.max(1, page))}
          onEdit={setEditingItem}
          onDelete={setDeletingItem}
        />
        <div className="flex items-center justify-end gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Per halaman</span>
          <select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
          </select>
        </div>
      </div>
      {isAdding && <AttendanceStatusDialog open={isAdding} isSaving={createMutation.isPending} onClose={() => setIsAdding(false)} onSave={handleCreate} />}
      {editingItem && <AttendanceStatusDialog open={Boolean(editingItem)} attendanceStatus={editingItem} isSaving={updateMutation.isPending} onClose={() => setEditingItem(null)} onSave={handleUpdate} />}
      {deletingItem && <DeleteAttendanceStatusDialog attendanceStatus={deletingItem} isDeleting={deleteMutation.isPending} onClose={() => setDeletingItem(null)} onConfirm={handleDelete} />}
    </main>
  );
}
