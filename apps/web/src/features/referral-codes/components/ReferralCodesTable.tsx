import {
  AlertCircle,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  Plus,
  Power,
  Ticket,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isReferralExpired, isReferralExhausted } from "../lib/referral-utils";
import type { ReferralCode } from "../types";

interface ReferralCodesTableProps {
  items: ReferralCode[];
  isLoading: boolean;
  isError: boolean;
  searchTerm?: string;
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewDetail: (item: ReferralCode) => void;
  onToggleActive: (item: ReferralCode) => void;
  onOpenCreate: () => void;
}

export function ReferralCodesTable({
  items,
  isLoading,
  isError,
  searchTerm,
  total,
  currentPage,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
  onViewDetail,
  onToggleActive,
  onOpenCreate,
}: ReferralCodesTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (item: ReferralCode) => {
    try {
      await navigator.clipboard.writeText(item.code);
      setCopiedId(item.id);
      toast.success(`Kode referral ${item.code} disalin ke clipboard.`);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Gagal menyalin kode ke clipboard.");
    }
  };

  const start = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-8 text-center text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">
        <AlertCircle className="mx-auto mb-2 size-8" />
        <p className="font-semibold text-base">Gagal memuat data kode referral</p>
        <p className="mt-1 text-sm opacity-90">
          Periksa koneksi jaringan dan pastikan backend API berjalan aktif.
        </p>
      </div>
    );
  }

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-950/40">
              <TableRow className="border-b border-slate-200 dark:border-slate-800">
                <TableHead className="w-56 font-semibold text-slate-700 dark:text-slate-300">
                  Kode Referral
                </TableHead>
                <TableHead className="w-48 font-semibold text-slate-700 dark:text-slate-300">
                  Penggunaan / Kuota
                </TableHead>
                <TableHead className="w-32 font-semibold text-slate-700 dark:text-slate-300">
                  Tahun Masuk
                </TableHead>
                <TableHead className="w-48 font-semibold text-slate-700 dark:text-slate-300">
                  Jurusan
                </TableHead>
                <TableHead className="w-44 font-semibold text-slate-700 dark:text-slate-300">
                  Masa Berlaku
                </TableHead>
                <TableHead className="w-32 font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </TableHead>
                <TableHead className="w-44 text-right font-semibold text-slate-700 dark:text-slate-300">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton preview
                  <TableRow
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-800/60"
                  >
                    <TableCell><Skeleton className="h-6 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-28 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-56 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                        <Ticket className="size-6" />
                      </div>
                      <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                        {searchTerm
                          ? "Tidak ditemukan kode referral yang sesuai"
                          : "Belum ada kode referral"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        {searchTerm
                          ? `Tidak ada kode referral yang cocok dengan kata kunci "${searchTerm}". Coba kata kunci lain.`
                          : "Buat kode referral baru untuk membuka jalur pendaftaran mandiri bagi calon siswa baru."}
                      </p>
                      {!searchTerm && (
                        <Button
                          type="button"
                          onClick={onOpenCreate}
                          className="mt-3 gap-2 bg-gradient-to-r from-blue-700 to-indigo-600 font-semibold text-white shadow-md hover:from-blue-800 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-500 text-xs h-9"
                        >
                          <Plus className="size-3.5" /> Buat Kode Referral Pertama
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const isExpired = isReferralExpired(item.expires_at);
                  const isExhausted = isReferralExhausted(
                    item.used_count,
                    item.usage_quota,
                  );
                  const isCopied = copiedId === item.id;

                  const usagePercent =
                    item.usage_quota !== null && item.usage_quota > 0
                      ? Math.min(
                          100,
                          Math.round((item.used_count / item.usage_quota) * 100),
                        )
                      : null;

                  return (
                    <TableRow
                      key={item.id}
                      className="group border-b border-slate-100 hover:bg-slate-50/80 dark:border-slate-800/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Kode Referral */}
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold tracking-wider text-blue-700 dark:text-blue-400">
                            {item.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition"
                            title="Salin kode"
                            aria-label="Salin kode"
                          >
                            {isCopied ? (
                              <Check className="size-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </TableCell>

                      {/* Penggunaan / Kuota */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                            <span className="font-semibold">{item.used_count}</span>
                            {item.usage_quota !== null ? (
                              <span className="text-slate-400"> / {item.usage_quota} siswa</span>
                            ) : (
                              <span className="text-slate-400"> / ∞ (Tanpa Batas)</span>
                            )}
                          </div>
                          {usagePercent !== null && (
                            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div
                                className={`h-full transition-all ${
                                  isExhausted
                                    ? "bg-rose-500"
                                    : usagePercent >= 75
                                      ? "bg-amber-500"
                                      : "bg-blue-600"
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Tahun Masuk */}
                      <TableCell>
                        {item.enrollment_year ? (
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {item.enrollment_year}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Semua Tahun</span>
                        )}
                      </TableCell>

                      {/* Jurusan */}
                      <TableCell>
                        {item.department ? (
                          <span className="font-medium text-xs text-slate-800 dark:text-slate-200">
                            {item.department.name}
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Semua Jurusan
                          </span>
                        )}
                      </TableCell>

                      {/* Masa Berlaku */}
                      <TableCell>
                        {item.expires_at ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
                              <Calendar className="size-3 text-slate-400" />
                              <span>
                                {new Date(item.expires_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            {isExpired && (
                              <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 block">
                                (Kedaluwarsa)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Tanpa Batas</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {!item.is_active ? (
                          <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                            Nonaktif
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                            Kedaluwarsa
                          </span>
                        ) : isExhausted ? (
                          <span className="inline-flex items-center rounded-full border border-rose-300 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                            Kuota Penuh
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                            Aktif
                          </span>
                        )}
                      </TableCell>

                      {/* Aksi */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Salin */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(item)}
                            className="h-8 px-2 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300"
                            title="Salin Kode"
                          >
                            {isCopied ? (
                              <Check className="size-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                            <span className="hidden sm:inline sm:ml-1">
                              {isCopied ? "Tersalin" : "Salin"}
                            </span>
                          </Button>

                          {/* Detail */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetail(item)}
                            className="h-8 px-2 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300"
                            title="Lihat Detail"
                          >
                            <Eye className="size-3.5" />
                            <span className="hidden sm:inline sm:ml-1">Detail</span>
                          </Button>

                          {/* Toggle Active */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onToggleActive(item)}
                            className={`h-8 px-2 text-xs ${
                              item.is_active
                                ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
                                : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                            }`}
                            title={item.is_active ? "Nonaktifkan Kode" : "Aktifkan Kode"}
                          >
                            <Power className="size-3.5" />
                            <span className="hidden sm:inline sm:ml-1">
                              {item.is_active ? "Nonaktifkan" : "Aktifkan"}
                            </span>
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

        {/* Integrated Pagination Footer */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 dark:border-slate-800 px-5 py-3.5 bg-slate-50/50 dark:bg-slate-950/30 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Baris per halaman:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ml-2">
              Menampilkan {start}-{end} dari {total} kode referral
            </span>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="h-8 gap-1 px-2.5 text-xs border-slate-200 dark:border-slate-800"
            >
              <ChevronLeft className="size-3.5" /> Sebelumnya
            </Button>
            <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
              {currentPage} / {Math.max(totalPages, 1)}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="h-8 gap-1 px-2.5 text-xs border-slate-200 dark:border-slate-800"
            >
              Berikutnya <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
