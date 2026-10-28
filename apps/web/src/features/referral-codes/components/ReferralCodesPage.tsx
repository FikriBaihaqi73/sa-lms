import { useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useCreateReferralCode,
  useReferralCodes,
  useReferralDepartments,
  useToggleActiveReferralCode,
} from "../hooks/useReferralCodes";
import type { CreateReferralCodeInput, ReferralCode } from "../types";
import { CreateReferralCodeDialog } from "./CreateReferralCodeDialog";
import { ReferralCodeDetailDialog } from "./ReferralCodeDetailDialog";
import { ReferralCodesFilterBar } from "./ReferralCodesFilterBar";
import { ReferralCodesHeader } from "./ReferralCodesHeader";
import { ReferralCodesStats } from "./ReferralCodesStats";
import { ReferralCodesTable } from "./ReferralCodesTable";

export function ReferralCodesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ReferralCode | null>(null);

  // Queries & Mutations
  const departmentsQuery = useReferralDepartments();
  const departments = departmentsQuery.data ?? [];

  const referralCodesQuery = useReferralCodes({
    page: currentPage,
    limit,
    search: debouncedSearch.trim() || undefined,
    status: statusFilter as "all" | "active" | "inactive" | "expired" | "exhausted",
    departmentId: departmentFilter || undefined,
  });

  const createMutation = useCreateReferralCode();
  const toggleActiveMutation = useToggleActiveReferralCode();

  const dataResult = referralCodesQuery.data;
  const items = dataResult?.data ?? [];
  const meta = dataResult?.meta;
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);

  const handleCreateSave = async (payload: CreateReferralCodeInput) => {
    try {
      await createMutation.mutateAsync(payload);
      toast.success("Kode referral berhasil dibuat!");
      setIsCreateOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat kode referral.",
      );
    }
  };

  const handleToggleActive = async (itemOrId: ReferralCode | string) => {
    const id = typeof itemOrId === "string" ? itemOrId : itemOrId.id;
    try {
      const updated = await toggleActiveMutation.mutateAsync(id);
      const message = updated.is_active
        ? `Kode ${updated.code} berhasil diaktifkan.`
        : `Kode ${updated.code} berhasil dinonaktifkan.`;
      toast.success(message);
      if (selectedDetail && selectedDetail.id === id) {
        setSelectedDetail(updated);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mengubah status kode referral.",
      );
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDepartmentFilter("");
    setCurrentPage(1);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <ReferralCodesHeader onOpenCreate={() => setIsCreateOpen(true)} />

        {/* Stats */}
        <ReferralCodesStats
          items={items}
          meta={meta}
          isLoading={referralCodesQuery.isPending}
        />

        {/* Filter Bar */}
        <ReferralCodesFilterBar
          search={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          status={statusFilter}
          onStatusChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}
          departmentId={departmentFilter}
          onDepartmentChange={(val) => {
            setDepartmentFilter(val);
            setCurrentPage(1);
          }}
          departments={departments}
          onResetFilters={handleResetFilters}
        />

        {/* Main Table */}
        <ReferralCodesTable
          items={items}
          isLoading={referralCodesQuery.isPending}
          isError={referralCodesQuery.isError}
          searchTerm={debouncedSearch.trim()}
          total={meta?.total ?? 0}
          currentPage={currentPage}
          totalPages={totalPages}
          limit={limit}
          onPageChange={setCurrentPage}
          onLimitChange={(l) => {
            setLimit(l);
            setCurrentPage(1);
          }}
          onViewDetail={(item) => setSelectedDetail(item)}
          onToggleActive={(item) => handleToggleActive(item)}
          onOpenCreate={() => setIsCreateOpen(true)}
        />
      </div>

      {/* Dialogs */}
      <CreateReferralCodeDialog
        open={isCreateOpen}
        departments={departments}
        isSaving={createMutation.isPending}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateSave}
      />

      <ReferralCodeDetailDialog
        referralCode={selectedDetail}
        open={Boolean(selectedDetail)}
        onClose={() => setSelectedDetail(null)}
        onToggleActive={handleToggleActive}
        isToggling={toggleActiveMutation.isPending}
      />
    </main>
  );
}
