import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ReferralCodeDepartment } from "../types";

interface ReferralCodesFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  departmentId: string;
  onDepartmentChange: (value: string) => void;
  departments: ReferralCodeDepartment[];
  onResetFilters: () => void;
}

export function ReferralCodesFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  departmentId,
  onDepartmentChange,
  departments,
  onResetFilters,
}: ReferralCodesFilterBarProps) {
  const hasActiveFilters = Boolean(
    search.trim() || (status && status !== "all") || departmentId,
  );

  return (
    <Card className="border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari kode referral..."
            className="h-10 pl-9 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-10 sm:w-44 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
            aria-label="Filter status kode referral"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
            <option value="expired">Kedaluwarsa</option>
            <option value="exhausted">Kuota Habis</option>
          </Select>

          {departments.length > 0 && (
            <Select
              value={departmentId}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="h-10 sm:w-48 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
              aria-label="Filter jurusan"
            >
              <option value="">Semua Jurusan</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </Select>
          )}

          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-10 text-xs gap-1 border-slate-200 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <X className="size-3.5" /> Reset
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
