import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect, useDeferredValue, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "./SearchableSelect";
import {
  useGuardianOptions,
  useStudentOptions,
} from "../hooks/useStudentGuardians";
import {
  studentGuardianFormSchema,
  type StudentGuardianFormValues,
} from "../schemas/studentGuardianSchema";
import type { StudentGuardian } from "../types";

interface StudentGuardianFormDialogProps {
  open: boolean;
  record: StudentGuardian | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: StudentGuardianFormValues) => Promise<void>;
}

const EMPTY_VALUES: StudentGuardianFormValues = {
  studentId: "",
  guardianId: "",
  isPrimary: false,
};

export function StudentGuardianFormDialog({
  open,
  record,
  isSaving,
  onClose,
  onSave,
}: StudentGuardianFormDialogProps) {
  const isEditing = Boolean(record);
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentGuardianFormValues>({
    resolver: zodResolver(studentGuardianFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const [studentSearch, setStudentSearch] = useState("");
  const [guardianSearch, setGuardianSearch] = useState("");
  const deferredStudentSearch = useDeferredValue(studentSearch);
  const deferredGuardianSearch = useDeferredValue(guardianSearch);

  const studentOptionsQuery = useStudentOptions(deferredStudentSearch);
  const guardianOptionsQuery = useGuardianOptions(deferredGuardianSearch);

  useEffect(() => {
    if (!open) return;
    setStudentSearch("");
    setGuardianSearch("");
    reset(
      record
        ? {
            studentId: record.studentId,
            guardianId: record.guardianId,
            isPrimary: record.isPrimary,
          }
        : EMPTY_VALUES,
    );
  }, [open, record, reset]);

  if (!open) return null;

  const studentId = watch("studentId");
  const guardianId = watch("guardianId");
  const isPrimary = watch("isPrimary");

  const studentOptions = (studentOptionsQuery.data?.pages ?? [])
    .flatMap((page) => page.data)
    .map((student) => ({
      id: student.id,
      label:
        student.profile?.fullName || student.studentNumber || "Siswa tanpa nama",
      hint: student.studentNumber,
    }));

  const guardianOptions = (guardianOptionsQuery.data?.pages ?? [])
    .flatMap((page) => page.data)
    .map((guardian) => ({
      id: guardian.id,
      label: guardian.fullName,
      hint: guardian.relationship ?? undefined,
    }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isEditing ? "Ubah Relasi" : "Tambah Relasi"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hubungkan siswa dengan wali atau orang tua.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Tutup dialog"
          >
            <X className="size-5" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit((values) => void onSave(values))}
          className="space-y-4 p-6"
        >
          <SearchableSelect
            label="Siswa"
            required
            value={studentId}
            valueLabel={
              record
                ? `${record.student?.profile?.fullName || "Siswa"} — ${record.student?.studentNumber}`
                : undefined
            }
            options={studentOptions}
            searchTerm={studentSearch}
            onSearchChange={setStudentSearch}
            onSelect={(id) => setValue("studentId", id, { shouldValidate: true })}
            isLoading={studentOptionsQuery.isPending}
            isError={studentOptionsQuery.isError}
            hasNextPage={Boolean(studentOptionsQuery.hasNextPage)}
            isFetchingNextPage={studentOptionsQuery.isFetchingNextPage}
            onLoadMore={() => void studentOptionsQuery.fetchNextPage()}
            error={errors.studentId?.message}
            placeholder="Cari nama atau NIM siswa..."
            emptyText="Siswa tidak ditemukan"
          />
          <SearchableSelect
            label="Wali"
            required
            value={guardianId}
            valueLabel={
              record
                ? `${record.guardian?.fullName}${record.guardian?.relationship ? ` (${record.guardian.relationship})` : ""}`
                : undefined
            }
            options={guardianOptions}
            searchTerm={guardianSearch}
            onSearchChange={setGuardianSearch}
            onSelect={(id) => setValue("guardianId", id, { shouldValidate: true })}
            isLoading={guardianOptionsQuery.isPending}
            isError={guardianOptionsQuery.isError}
            hasNextPage={Boolean(guardianOptionsQuery.hasNextPage)}
            isFetchingNextPage={guardianOptionsQuery.isFetchingNextPage}
            onLoadMore={() => void guardianOptionsQuery.fetchNextPage()}
            error={errors.guardianId?.message}
            placeholder="Cari nama wali..."
            emptyText="Wali tidak ditemukan"
          />
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(event) =>
                setValue("isPrimary", event.target.checked, {
                  shouldValidate: true,
                })
              }
              className="size-4"
            />
            <span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Jadikan wali utama
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                Wali utama ditandai label "Wali Utama" pada tabel.
              </span>
            </span>
          </label>
          {errors.isPrimary && (
            <p className="text-xs font-medium text-red-500">
              {errors.isPrimary.message}
            </p>
          )}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="h-10 px-4 text-sm font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Menyimpan...
                </span>
              ) : isEditing ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Relasi"
              )}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
