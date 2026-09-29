import React, { useMemo, useState } from 'react';
import {
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from '../hooks/usePermissions';
import { PermissionHeader } from './PermissionHeader';
import { PermissionStats } from './PermissionStats';
import { PermissionTable } from './PermissionTable';
import { PermissionFormModal } from './PermissionFormModal';
import { PermissionDeleteDialog } from './PermissionDeleteDialog';
import type { Permission } from '../types';
import type { PermissionFormValues } from '../schemas/permissionSchema';

export const PermissionPage: React.FC = () => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');

  // Modal & Dialog state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Queries & Mutations
  const { data: permissions = [], isLoading, isError } = usePermissions();
  const createMutation = useCreatePermission();
  const updateMutation = useUpdatePermission();
  const deleteMutation = useDeletePermission();

  // Extract unique modules list for filter dropdown
  const availableModules = useMemo(() => {
    return Array.from(new Set(permissions.map((p) => p.module))).sort();
  }, [permissions]);

  // Filter permissions based on search term and selected module
  const filteredPermissions = useMemo(() => {
    return permissions.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesModule = selectedModule === 'ALL' || item.module === selectedModule;

      return matchesSearch && matchesModule;
    });
  }, [permissions, searchTerm, selectedModule]);

  // Handlers for Create / Edit Form
  const handleOpenCreate = () => {
    setEditingPermission(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (values: PermissionFormValues) => {
    try {
      if (editingPermission) {
        await updateMutation.mutateAsync({
          id: editingPermission.id,
          data: values,
        });
        showToast(`Permission '${values.name}' berhasil diperbarui.`);
      } else {
        await createMutation.mutateAsync(values);
        showToast(`Permission baru '${values.name}' berhasil dibuat.`);
      }
      setIsFormModalOpen(false);
      setEditingPermission(null);
    } catch (err: any) {
      showToast(err?.message || 'Gagal menyimpan permission.', 'error');
    }
  };

  // Handlers for Delete Dialog
  const handleOpenDelete = (permission: Permission) => {
    setDeletingPermission(permission);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPermission) return;
    try {
      await deleteMutation.mutateAsync(deletingPermission.id);
      showToast(`Permission '${deletingPermission.name}' berhasil dihapus.`);
      setIsDeleteDialogOpen(false);
      setDeletingPermission(null);
    } catch (err: any) {
      showToast(err?.message || 'Gagal menghapus permission.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast Alert Notification */}
        {toastMessage && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-top-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-red-600 text-white border-red-500'
            }`}
          >
            {toastMessage.text}
          </div>
        )}

        {/* Page Header with Controls */}
        <PermissionHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedModule={selectedModule}
          onModuleChange={setSelectedModule}
          availableModules={availableModules}
          onOpenCreateModal={handleOpenCreate}
        />

        {/* Stats Overview */}
        <PermissionStats permissions={permissions} />

        {/* Data Table */}
        <PermissionTable
          permissions={filteredPermissions}
          isLoading={isLoading}
          isError={isError}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          searchTerm={searchTerm}
        />

        {/* Create & Edit Modal */}
        <PermissionFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingPermission}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />

        {/* Delete Confirmation Modal */}
        <PermissionDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          permission={deletingPermission}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </div>
  );
};
