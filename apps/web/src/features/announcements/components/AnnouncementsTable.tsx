import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Megaphone,
  Plus,
  Trash2,
} from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import type { Announcement } from "../types";
import {
  CategoryBadge,
  PublicationStatusBadge,
  TargetAudienceBadge,
} from "./AnnouncementBadges";

interface AnnouncementsTableProps {
  data: Announcement[];
  page: number;
  totalPages: number;
  totalData: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onViewDetail: (announcement: Announcement) => void;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
  onAddNew: () => void;
}

export const AnnouncementsTable: React.FC<AnnouncementsTableProps> = ({
  data,
  page,
  totalPages,
  totalData,
  isLoading,
  onPageChange,
  onViewDetail,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Memuat data pengumuman...
          </p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
          <Megaphone className="size-7" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
          Belum ada data pengumuman
        </h3>
        <p className="mt-1.5 max-w-sm text-xs text-slate-500 dark:text-slate-400">
          Belum ada pengumuman yang sesuai dengan filter atau dibuat untuk institusi ini.
        </p>
        <Button
          type="button"
          onClick={onAddNew}
          className="mt-5 h-9 gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="size-4" />
          <span>Buat Pengumuman Pertama</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="w-12 px-4 py-3 text-center">No</th>
              <th className="px-4 py-3">Judul & Rincian</th>
              <th className="px-4 py-3 text-center">Kategori</th>
              <th className="px-4 py-3 text-center">Target Penerima</th>
              <th className="px-4 py-3">Waktu Mulai Tayang</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3">Pembuat</th>
              <th className="w-24 px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((item, idx) => {
              const indexNum = (page - 1) * 10 + (idx + 1);
              const authorName =
                item.creator?.profile?.fullName ||
                item.creator?.email ||
                "Admin Institusi";

              const publishedDateStr = item.published_at
                ? new Date(item.published_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "-";

              return (
                <tr
                  key={item.id}
                  className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3.5 text-center text-slate-400 font-mono">
                    {indexNum}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="min-w-[200px] max-w-sm">
                      <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </p>
                      {item.contentBody && (
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {item.contentBody}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <CategoryBadge category={item.category} />
                  </td>

                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <TargetAudienceBadge audience={item.targetAudience} />
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Calendar className="size-3.5 text-slate-400" />
                      <span>{publishedDateStr}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <PublicationStatusBadge isPublished={item.is_published} />
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                      {authorName}
                    </p>
                  </td>

                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(item)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        title="Lihat Rincian Pengumuman"
                        aria-label="Lihat Detail"
                      >
                        <Eye className="size-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        title="Ubah Pengumuman"
                        aria-label="Ubah Pengumuman"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item)}
                        className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                        title="Hapus Pengumuman"
                        aria-label="Hapus Pengumuman"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <p className="text-slate-500">
          Menampilkan <span className="font-semibold text-slate-800 dark:text-slate-200">{data.length}</span> dari{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{totalData}</span> pengumuman
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 gap-1 px-2.5 text-xs font-semibold"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="size-3.5" />
            <span>Sebelumnya</span>
          </Button>

          <span className="px-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            Halaman {page} dari {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 gap-1 px-2.5 text-xs font-semibold"
            aria-label="Halaman selanjutnya"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
