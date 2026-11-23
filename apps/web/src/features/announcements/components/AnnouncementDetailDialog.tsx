import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Megaphone,
  User,
} from "lucide-react";
import type { Announcement } from "../types";
import {
  CategoryBadge,
  TargetAudienceBadge,
} from "./AnnouncementBadges";

interface AnnouncementDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
  onEdit?: (announcement: Announcement) => void;
}

function formatFullDateTime(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function AnnouncementDetailDialog({
  open,
  onOpenChange,
  announcement,
  onEdit,
}: AnnouncementDetailDialogProps) {
  if (!announcement) return null;

  const creatorName =
    announcement.creator?.profile?.fullName ||
    announcement.creator?.email ||
    "Administrator";

  const contentText =
    announcement.contentBody || announcement.content || "Tidak ada rincian konten.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[650px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Megaphone className="size-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <TargetAudienceBadge audience={announcement.targetAudience} />
                <CategoryBadge category={announcement.category} />
                {announcement.is_published ? (
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="mr-1 size-3" />
                    Diterbitkan
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                  >
                    <AlertCircle className="mr-1 size-3" />
                    Draf
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl font-bold leading-snug text-slate-900 dark:text-slate-100">
                {announcement.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                ID Pengumuman: {announcement.id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 gap-2 rounded-lg border bg-slate-50/50 p-3 sm:grid-cols-2 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <User className="size-3.5 shrink-0 text-slate-400" />
              <span>Dibuat oleh: <strong className="text-slate-800 dark:text-slate-200">{creatorName}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Building2 className="size-3.5 shrink-0 text-slate-400" />
              <span>Institusi: <strong className="text-slate-800 dark:text-slate-200">{announcement.institution?.name || "Institusi Anda"}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Calendar className="size-3.5 shrink-0 text-slate-400" />
              <span>Mulai Tayang: <strong className="text-slate-800 dark:text-slate-200">{formatFullDateTime(announcement.published_at || announcement.created_at)}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Clock className="size-3.5 shrink-0 text-slate-400" />
              <span>Berakhir: <strong className="text-slate-800 dark:text-slate-200">{announcement.expired_at ? formatFullDateTime(announcement.expired_at) : "Tanpa Batas"}</strong></span>
            </div>
          </div>

          {/* Isi Pengumuman */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Isi Lengkap Pengumuman
            </h4>
            <div className="rounded-lg border bg-card p-4 text-sm leading-relaxed text-slate-800 shadow-xs whitespace-pre-wrap dark:text-slate-200">
              {contentText}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between pt-3">
          <div className="text-[11px] text-muted-foreground">
            Terakhir diubah: {formatFullDateTime(announcement.updated_at)}
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(announcement);
                }}
                className="gap-1.5"
              >
                <Edit2 className="size-3.5" />
                Ubah
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Tutup
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
