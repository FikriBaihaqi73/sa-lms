import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Attendance } from "../types";

interface DeleteAttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  attendance?: Attendance | null;
  isDeleting?: boolean;
}

export const DeleteAttendanceDialog: React.FC<DeleteAttendanceDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  attendance,
  isDeleting = false,
}) => {
  const studentName =
    attendance?.student?.profile?.fullName || "Siswa terpilih";
  const statusName = attendance?.attendance_status?.name || "Presensi";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle>Hapus Data Presensi</DialogTitle>
          <DialogDescription className="text-center">
            Apakah Anda yakin ingin menghapus data presensi status{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              "{statusName}"
            </span>{" "}
            untuk siswa{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {studentName}
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            data-testid="confirm-delete-button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isDeleting ? "Menghapus..." : "Hapus Presensi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
