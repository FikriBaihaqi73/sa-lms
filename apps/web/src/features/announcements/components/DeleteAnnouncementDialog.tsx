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
import { useDeleteAnnouncement } from "../hooks/useAnnouncements";
import type { Announcement } from "../types";

interface DeleteAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
}

export function DeleteAnnouncementDialog({
  open,
  onOpenChange,
  announcement,
}: DeleteAnnouncementDialogProps) {
  const { mutate: deleteAnnouncement, isPending } = useDeleteAnnouncement();

  if (!announcement) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pengumuman?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Pengumuman resmi{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              "{announcement.title}"
            </span>{" "}
            akan dihapus secara permanen dari sistem institusi Anda.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              deleteAnnouncement(announcement.id, {
                onSuccess: () => onOpenChange(false),
              });
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Menghapus..." : "Hapus Pengumuman"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
