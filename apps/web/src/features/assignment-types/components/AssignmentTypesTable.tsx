import { Search, Edit3, Trash2, BookOpen, Calendar } from "lucide-react";
import type { AssignmentType } from "../types";

interface AssignmentTypesTableProps {
  types: AssignmentType[];
  isLoading: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  onEdit: (item: AssignmentType) => void;
  onDelete: (item: AssignmentType) => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function AssignmentTypesTable({
  types,
  isLoading,
  search,
  onSearchChange,
  onEdit,
  onDelete,
}: AssignmentTypesTableProps) {
  const filtered = types.filter((item) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari tipe tugas atau deskripsi..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Menampilkan <span className="font-semibold">{filtered.length}</span>{" "}
          dari <span className="font-semibold">{types.length}</span> tipe tugas
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200/80 bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-3.5 font-semibold">
                  Nama Tipe
                </th>
                <th scope="col" className="px-6 py-3.5 font-semibold">
                  Deskripsi
                </th>
                <th scope="col" className="px-6 py-3.5 font-semibold">
                  Dibuat
                </th>
                <th scope="col" className="px-6 py-3.5 font-semibold">
                  Diperbarui
                </th>
                <th scope="col" className="px-6 py-3.5 text-right font-semibold">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={`loading-row-${idx}`}>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="ml-auto h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {search ? "Tidak ada hasil yang cocok" : "Belum ada tipe tugas"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {search
                        ? "Coba kata kunci pencarian lainnya."
                        : "Klik tombol Tambah Tipe Tugas untuk membuat baru."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-slate-600 dark:text-slate-300">
                      {item.description || (
                        <span className="italic text-slate-400 dark:text-slate-500">
                          Tidak ada deskripsi
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(item.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(item.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-red-500 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
