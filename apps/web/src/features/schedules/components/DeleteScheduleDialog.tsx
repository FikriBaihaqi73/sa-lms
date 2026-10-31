import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Schedule } from "../types";
import { formatTimeRange } from "../utils";

interface DeleteScheduleDialogProps {
  item: Schedule | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteScheduleDialog({
  item,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteScheduleDialogProps) {
  const className = item?.classSubject?.class?.name ?? "Kelas";
  const subjectName = item?.classSubject?.subject?.name ?? "Mata Pelajaran";
  const roomName = item?.classroom?.roomName ?? "Ruangan";
  const timeText = item ? formatTimeRange(item.startTime, item.endTime) : "";

  return (
    <AlertDialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <AlertTriangle className="size-5" />
          </div>
          <AlertDialogTitle>Hapus Jadwal Pelajaran?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-slate-600 dark:text-slate-400">
            <span>
              Apakah Anda yakin ingin menghapus jadwal untuk{" "}
              <strong className="text-slate-900 dark:text-slate-100">
                {className} - {subjectName}
              </strong>
              ?
            </span>
            {item && (
              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Hari & Waktu:</span>{" "}
                  {item.day}, {timeText}
                </div>
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Ruangan:</span>{" "}
                  {roomName}
                </div>
              </div>
            )}
            <span className="block pt-1 text-xs text-red-500 dark:text-red-400">
              Tindakan ini akan menghapus alokasi jadwal tersebut secara soft delete.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button" disabled={isDeleting} onClick={onClose}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isDeleting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin" /> Menghapus...
              </span>
            ) : (
              "Hapus Jadwal"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
