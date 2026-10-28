import {
  Calendar,
  CalendarClock,
  Check,
  Copy,
  Layers,
  Power,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isReferralExpired, isReferralExhausted } from "../lib/referral-utils";
import type { ReferralCode } from "../types";

interface ReferralCodeDetailDialogProps {
  referralCode: ReferralCode | null;
  open: boolean;
  onClose: () => void;
  onToggleActive: (id: string) => Promise<void>;
  isToggling?: boolean;
}

export function ReferralCodeDetailDialog({
  referralCode,
  open,
  onClose,
  onToggleActive,
  isToggling,
}: ReferralCodeDetailDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!open || !referralCode) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      toast.success("Kode referral disalin ke clipboard!");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin kode referral.");
    }
  };

  const isExpired = isReferralExpired(referralCode.expires_at);
  const isExhausted = isReferralExhausted(
    referralCode.used_count,
    referralCode.usage_quota,
  );

  const usagePercent =
    referralCode.usage_quota !== null
      ? Math.min(
          100,
          Math.round((referralCode.used_count / referralCode.usage_quota) * 100),
        )
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
              <Ticket className="size-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Detail Kode Referral
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Informasi kuota, ketentuan, dan penggunaan kode
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Tutup"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 p-6">
          {/* Highlight Code Card */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Kode Referral
              </span>
              <p className="font-mono text-xl font-bold tracking-wider text-blue-700 dark:text-blue-300">
                {referralCode.code}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 font-semibold"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-emerald-600" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  <span>Salin</span>
                </>
              )}
            </Button>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {referralCode.is_active ? (
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                ● Status Aktif
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                ○ Nonaktif
              </span>
            )}

            {isExpired && (
              <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                Kedaluwarsa
              </span>
            )}

            {isExhausted && (
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                Kuota Penuh
              </span>
            )}
          </div>

          {/* Detail Properties */}
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white text-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {/* Penggunaan / Kuota */}
            <div className="p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Users className="size-4" /> Penggunaan / Kuota
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {referralCode.used_count} /{" "}
                  {referralCode.usage_quota !== null
                    ? `${referralCode.usage_quota} pendaftar`
                    : "Tanpa Batas"}
                </span>
              </div>
              {usagePercent !== null && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full transition-all ${
                      usagePercent >= 100
                        ? "bg-red-500"
                        : usagePercent >= 75
                          ? "bg-amber-500"
                          : "bg-blue-600"
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              )}
            </div>

            {/* Tahun Masuk */}
            <div className="flex items-center justify-between p-3.5">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Calendar className="size-4" /> Tahun Masuk
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {referralCode.enrollment_year
                  ? `Tahun ${referralCode.enrollment_year}`
                  : "Semua Tahun"}
              </span>
            </div>

            {/* Jurusan */}
            <div className="flex items-center justify-between p-3.5">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Layers className="size-4" /> Jurusan
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {referralCode.department?.name || "Semua Jurusan"}
              </span>
            </div>

            {/* Masa Berlaku */}
            <div className="flex items-center justify-between p-3.5">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <CalendarClock className="size-4" /> Masa Berlaku
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {referralCode.expires_at
                  ? new Date(referralCode.expires_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Tanpa Batas Waktu"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
          <Button
            type="button"
            variant={referralCode.is_active ? "destructive" : "default"}
            size="sm"
            onClick={() => onToggleActive(referralCode.id)}
            disabled={isToggling}
            className="gap-1.5 text-xs font-semibold"
          >
            <Power className="size-3.5" />
            {referralCode.is_active ? "Nonaktifkan Kode" : "Aktifkan Kode"}
          </Button>

          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
