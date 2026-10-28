import { Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReferralCodesHeaderProps {
  onOpenCreate: () => void;
}

export function ReferralCodesHeader({ onOpenCreate }: ReferralCodesHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
          <Ticket className="size-3.5" /> Pendaftaran Siswa
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Kode Referral
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Kelola kuota, jurusan, masa berlaku, dan distribusi kode referral pendaftaran mandiri calon siswa.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={onOpenCreate}
          className="h-10 gap-2 bg-gradient-to-r from-blue-700 to-indigo-600 font-semibold text-white shadow-md hover:from-blue-800 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-500"
        >
          <Plus className="size-4" /> Buat Kode Referral
        </Button>
      </div>
    </header>
  );
}
