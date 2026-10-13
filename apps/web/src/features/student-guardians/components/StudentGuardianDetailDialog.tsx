import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudentGuardian } from "../types";

interface StudentGuardianDetailDialogProps {
  open: boolean;
  record: StudentGuardian | undefined;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("id-ID");
}

export function StudentGuardianDetailDialog({
  open,
  record,
  isLoading,
  isError,
  onClose,
}: StudentGuardianDetailDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Detail Relasi
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Tutup dialog"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60"
                />
              ))}
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              <AlertCircle className="size-4" />
              Gagal memuat detail relasi.
            </div>
          )}
          {!isLoading && !isError && record && (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Siswa</dt>
                <dd className="text-right font-medium text-slate-800 dark:text-slate-200">
                  {record.student?.profile?.fullName || "Profil belum tersedia"} (
                  {record.student?.studentNumber})
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Wali</dt>
                <dd className="text-right font-medium text-slate-800 dark:text-slate-200">
                  {record.guardian?.fullName}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Hubungan</dt>
                <dd className="text-right text-slate-700 dark:text-slate-300">
                  {record.guardian?.relationship ?? "-"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Telepon</dt>
                <dd className="text-right text-slate-700 dark:text-slate-300">
                  {record.guardian?.phoneNumber ?? "-"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Email</dt>
                <dd className="text-right text-slate-700 dark:text-slate-300">
                  {record.guardian?.email ?? "-"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Status</dt>
                <dd className="text-right text-slate-700 dark:text-slate-300">
                  {record.isPrimary ? "Wali Utama" : "Wali Tambahan"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Dibuat</dt>
                <dd className="text-right text-slate-700 dark:text-slate-300">
                  {formatDate(record.createdAt)}
                </dd>
              </div>
            </dl>
          )}
          <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-4 text-sm font-semibold"
            >
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
