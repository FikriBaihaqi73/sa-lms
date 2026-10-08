import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeachersHeaderProps {
  onOpenCreate: () => void;
}

export function TeachersHeader({ onOpenCreate }: TeachersHeaderProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Master data <span className="mx-1 text-slate-300 dark:text-slate-600">/</span> Pendidik
        &amp; Staf Pengajar
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Guru / Teacher
            </h1>
            <Badge variant="secondary" className="text-[11px]">
              Master Registry
            </Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Kelola data master guru: identitas, NIP, status kepegawaian, spesialisasi, dan
            penugasan kelas. Halaman ini tidak membuat akun login.
          </p>
        </div>
        <Button
          type="button"
          onClick={onOpenCreate}
          className="h-10 bg-blue-700 font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Plus className="mr-2 size-4" /> Tambah guru
        </Button>
      </div>
    </div>
  );
}
