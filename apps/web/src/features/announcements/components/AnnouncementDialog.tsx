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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Megaphone } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useCreateAnnouncement,
  useUpdateAnnouncement,
} from "../hooks/useAnnouncements";
import {
  type AnnouncementFormValues,
  announcementFormSchema,
} from "../schemas/announcementSchema";
import type {
  Announcement,
  AnnouncementCategory,
  TargetAudience,
} from "../types";

interface AnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement | null;
}

function toDateTimeLocal(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
}

export function AnnouncementDialog({
  open,
  onOpenChange,
  announcement,
}: AnnouncementDialogProps) {
  const isEditing = Boolean(announcement);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      targetAudience: "ALL",
      category: "GENERAL",
      content: "",
      isPublished: true,
      publishedAt: "",
      expiredAt: "",
    },
  });

  const { mutate: createAnnouncement, isPending: isCreating } =
    useCreateAnnouncement();
  const { mutate: updateAnnouncement, isPending: isUpdating } =
    useUpdateAnnouncement();

  useEffect(() => {
    if (open && announcement) {
      form.reset({
        title: announcement.title || "",
        targetAudience: announcement.targetAudience || "ALL",
        category: announcement.category || "GENERAL",
        content: announcement.contentBody || announcement.content || "",
        isPublished: announcement.is_published ?? true,
        publishedAt: toDateTimeLocal(announcement.published_at),
        expiredAt: toDateTimeLocal(announcement.expired_at),
      });
    } else if (open && !announcement) {
      form.reset({
        title: "",
        targetAudience: "ALL",
        category: "GENERAL",
        content: "",
        isPublished: true,
        publishedAt: "",
        expiredAt: "",
      });
    }
  }, [open, announcement, form]);

  const applyFieldErrors = (error: Error) => {
    if (!(error instanceof ApiError)) return;
    for (const { field, message } of error.fieldErrors) {
      if (
        field === "title" ||
        field === "targetAudience" ||
        field === "category" ||
        field === "content" ||
        field === "isPublished" ||
        field === "publishedAt" ||
        field === "expiredAt"
      ) {
        form.setError(field as keyof AnnouncementFormValues, {
          type: "server",
          message,
        });
      }
    }
  };

  const onSubmit = (values: AnnouncementFormValues) => {
    const payload = {
      title: values.title,
      content: values.content,
      targetAudience: values.targetAudience as TargetAudience,
      category: values.category as AnnouncementCategory,
      isPublished: values.isPublished,
      publishedAt: values.publishedAt
        ? new Date(values.publishedAt).toISOString()
        : null,
      expiredAt: values.expiredAt
        ? new Date(values.expiredAt).toISOString()
        : null,
    };

    if (isEditing && announcement) {
      updateAnnouncement(
        { id: announcement.id, data: payload },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
          onError: applyFieldErrors,
        },
      );
    } else {
      createAnnouncement(payload, {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: applyFieldErrors,
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[620px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Megaphone className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {isEditing ? "Ubah Pengumuman" : "Buat Pengumuman Baru"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isEditing
                  ? "Perbarui informasi pengumuman resmi institusi."
                  : "Buat pengumuman baru untuk dibagikan kepada guru, siswa, atau seluruh pengguna."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Judul Pengumuman */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Judul Pengumuman <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Jadwal Ujian Akhir Semester Ganjil 2026/2027"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Audiens & Kategori */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Target Penerima <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select {...field} value={field.value || "ALL"}>
                        <option value="ALL">Semua Pengguna (Umum)</option>
                        <option value="TEACHER">Khusus Guru / Pengajar</option>
                        <option value="STUDENT">Khusus Siswa</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Kategori <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select {...field} value={field.value || "GENERAL"}>
                        <option value="GENERAL">Umum</option>
                        <option value="ACADEMIC">Akademik & Perkuliahan</option>
                        <option value="EVENT">Kegiatan / Agenda</option>
                        <option value="IMPORTANT">Penting & Mendesak</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Isi Konten Pengumuman */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Isi Pengumuman <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <textarea
                      rows={5}
                      placeholder="Tuliskan isi lengkap pengumuman di sini..."
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Publikasi Switch */}
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-semibold">
                      Publikasikan Sekarang
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Jika dinonaktifkan, pengumuman akan disimpan sebagai draf
                      dan tidak tampil kepada pengguna.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Tanggal Terbit & Kedaluwarsa */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="publishedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Waktu Mulai Tayang
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiredAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Batas Waktu Tayang (Opsional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Menyimpan..."
                  : isEditing
                    ? "Simpan Perubahan"
                    : "Terbitkan Pengumuman"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
