import { useState } from "react";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatScoreRange, getGradeColorBadge } from "../types";
import type { StandardGrade } from "../types";

interface GradesTableProps {
  grades: StandardGrade[];
  isLoading: boolean;
  onEdit: (grade: StandardGrade) => void;
  onDelete: (grade: StandardGrade) => void;
  onAdd: () => void;
}

export function GradesTable({
  grades,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: GradesTableProps) {
  const [search, setSearch] = useState("");

  const filtered = grades
    .filter((g) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      const matchGrade = g.grade.toLowerCase().includes(q);
      const matchDesc = (g.description ?? "").toLowerCase().includes(q);
      return matchGrade || matchDesc;
    })
    .sort((a, b) => {
      const minA = a.minimumScore ?? 0;
      const minB = b.minimumScore ?? 0;
      return minB - minA;
    });

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari predikat atau rubrik..."
            className="pl-9 h-9 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Menampilkan <span className="font-semibold text-slate-800 dark:text-slate-200">{filtered.length}</span> dari {grades.length} standar penilaian
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-950/40">
              <TableRow className="border-b border-slate-200 dark:border-slate-800">
                <TableHead className="w-28 font-semibold text-slate-700 dark:text-slate-300">
                  Predikat / Grade
                </TableHead>
                <TableHead className="w-44 font-semibold text-slate-700 dark:text-slate-300">
                  Rentang Nilai
                </TableHead>
                <TableHead className="w-32 font-semibold text-slate-700 dark:text-slate-300">
                  Skor Min
                </TableHead>
                <TableHead className="w-32 font-semibold text-slate-700 dark:text-slate-300">
                  Skor Max
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  Keterangan / Rubrik
                </TableHead>
                <TableHead className="w-24 text-right font-semibold text-slate-700 dark:text-slate-300">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton preview
                  <TableRow key={idx} className="border-b border-slate-100 dark:border-slate-800/60">
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {search.trim()
                          ? `Tidak ditemukan standar nilai dengan kata kunci "${search}".`
                          : "Belum ada standar penilaian yang dikonfigurasi."}
                      </p>
                      {!search.trim() && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onAdd}
                          className="mt-2 gap-1 text-xs"
                        >
                          <Plus className="size-3.5" /> Tambah Standar Pertama
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => {
                  const theme = getGradeColorBadge(item.grade);
                  const rangeText = formatScoreRange(item.minimumScore, item.maximumScore);

                  return (
                    <TableRow
                      key={item.id}
                      className="border-b border-slate-100 dark:border-slate-800/60 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${theme.bg} ${theme.text} ${theme.border}`}
                        >
                          <span className={`size-1.5 rounded-full ${theme.dot}`} />
                          {item.grade}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {rangeText}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {item.minimumScore != null ? item.minimumScore.toFixed(2).replace(/\.00$/, "") : "-"}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {item.maximumScore != null ? item.maximumScore.toFixed(2).replace(/\.00$/, "") : "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                        {item.description || (
                          <span className="text-slate-400 dark:text-slate-500 italic">
                            Tanpa keterangan
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                            title="Edit Standar Nilai"
                            className="size-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item)}
                            title="Hapus Standar Nilai"
                            className="size-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
