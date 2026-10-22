import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Department, DepartmentPaginationMeta } from "../types";

interface DepartmentsTableProps {
  departments: Department[];
  meta?: DepartmentPaginationMeta;
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  onAdd: () => void;
}

export function DepartmentsTable({
  departments,
  meta,
  isLoading,
  search,
  onSearchChange,
  onPageChange,
  onEdit,
  onDelete,
  onAdd,
}: DepartmentsTableProps) {
  const currentPage = meta?.currentPage ?? 1;
  const totalPages = meta?.totalPages ?? 1;
  const totalData = meta?.totalData ?? departments.length;

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama atau kode departemen..."
            className="pl-9 h-9 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Menampilkan <span className="font-semibold text-slate-800 dark:text-slate-200">{departments.length}</span> dari {totalData} departemen
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-950/40">
              <TableRow className="border-b border-slate-200 dark:border-slate-800">
                <TableHead className="w-64 font-semibold text-slate-700 dark:text-slate-300">
                  Nama Departemen
                </TableHead>
                <TableHead className="w-36 font-semibold text-slate-700 dark:text-slate-300">
                  Kode
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  Staf / Guru Ditetapkan
                </TableHead>
                <TableHead className="w-28 text-center font-semibold text-slate-700 dark:text-slate-300">
                  Total Guru
                </TableHead>
                <TableHead className="w-24 text-right font-semibold text-slate-700 dark:text-slate-300">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton preview
                  <TableRow key={idx} className="border-b border-slate-100 dark:border-slate-800/60">
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-56" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Building2 className="size-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {search.trim()
                          ? `Tidak ditemukan departemen dengan kata kunci "${search}".`
                          : "Belum ada departemen yang terdaftar di institusi Anda."}
                      </p>
                      {!search.trim() && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onAdd}
                          className="mt-2 gap-1 text-xs"
                        >
                          <Plus className="size-3.5" /> Tambah Departemen Pertama
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((dept) => {
                  const teachers = dept.teachers ?? [];
                  const teacherCount = teachers.length > 0 ? teachers.length : (dept._count?.teachers ?? 0);

                  return (
                    <TableRow
                      key={dept.id}
                      className="border-b border-slate-100 dark:border-slate-800/60 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-bold text-xs">
                            <Building2 className="size-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                              {dept.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Dibuat: {new Date(dept.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {dept.code}
                        </span>
                      </TableCell>
                      <TableCell>
                        {teachers.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {teachers.slice(0, 3).map((t) => (
                              <span
                                key={t.id}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                title={`NIP: ${t.teacher_number}`}
                              >
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                {t.profile?.fullName ?? t.teacher_number}
                              </span>
                            ))}
                            {teachers.length > 3 && (
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                                +{teachers.length - 3} lainnya
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs italic text-slate-400 dark:text-slate-500">
                            Belum ada staf ditugaskan
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Users className="size-3 text-slate-400" />
                          {teacherCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(dept)}
                            title="Edit Departemen"
                            className="size-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(dept)}
                            title="Hapus Departemen"
                            className="size-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Halaman <span className="font-semibold text-slate-800 dark:text-slate-200">{currentPage}</span> dari {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="h-8 gap-1 text-xs"
              >
                <ChevronLeft className="size-3.5" /> Sebelumnya
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                className="h-8 gap-1 text-xs"
              >
                Selanjutnya <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
