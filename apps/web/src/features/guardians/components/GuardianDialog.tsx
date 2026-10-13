import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeartHandshake, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guardianFormSchema, type GuardianFormValues } from "../schemas/guardianSchema";
import type { Guardian } from "../types";

interface GuardianDialogProps {
  open: boolean;
  guardian?: Guardian | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: GuardianFormValues) => Promise<void>;
}

export function GuardianDialog({
  open,
  guardian,
  isSaving,
  onClose,
  onSave,
}: GuardianDialogProps) {
  const isEditing = Boolean(guardian);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianFormSchema),
    defaultValues: {
      fullName: "",
      relationship: "",
      phoneNumber: "",
      email: "",
      address: "",
      occupation: "",
    },
  });

  useEffect(() => {
    reset({
      fullName: guardian?.fullName ?? "",
      relationship: guardian?.relationship ?? "",
      phoneNumber: guardian?.phoneNumber ?? "",
      email: guardian?.email ?? "",
      address: guardian?.address ?? "",
      occupation: guardian?.occupation ?? "",
    });
  }, [guardian, open, reset]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guardian-dialog-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
              <HeartHandshake className="size-5" />
            </span>
            <div>
              <h2 id="guardian-dialog-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {isEditing ? "Ubah Guardian" : "Tambah Guardian"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? "Perbarui data wali murid yang sudah ada"
                  : "Tambahkan data wali murid (guardian) baru ke sistem"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Tutup dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="guardian-fullName" className="text-sm font-semibold">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="guardian-fullName"
              {...register("fullName")}
              maxLength={255}
              disabled={isSaving}
              placeholder="Contoh: Budi Santoso"
              className="h-11"
            />
            {errors.fullName && <p className="text-xs font-medium text-red-500">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guardian-relationship" className="text-sm font-semibold">
                Hubungan dengan Siswa
              </Label>
              <Input
                id="guardian-relationship"
                {...register("relationship")}
                maxLength={100}
                disabled={isSaving}
                placeholder="Contoh: Ayah"
                className="h-11"
              />
              {errors.relationship && <p className="text-xs font-medium text-red-500">{errors.relationship.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian-phoneNumber" className="text-sm font-semibold">
                Nomor Telepon
              </Label>
              <Input
                id="guardian-phoneNumber"
                {...register("phoneNumber")}
                maxLength={30}
                disabled={isSaving}
                placeholder="Contoh: 081234567890"
                className="h-11"
              />
              {errors.phoneNumber && <p className="text-xs font-medium text-red-500">{errors.phoneNumber.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guardian-email" className="text-sm font-semibold">
                Email
              </Label>
              <Input
                id="guardian-email"
                type="email"
                {...register("email")}
                maxLength={255}
                disabled={isSaving}
                placeholder="Contoh: budi@example.com"
                className="h-11"
              />
              {errors.email && <p className="text-xs font-medium text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian-occupation" className="text-sm font-semibold">
                Pekerjaan
              </Label>
              <Input
                id="guardian-occupation"
                {...register("occupation")}
                maxLength={100}
                disabled={isSaving}
                placeholder="Contoh: Wiraswasta"
                className="h-11"
              />
              {errors.occupation && <p className="text-xs font-medium text-red-500">{errors.occupation.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardian-address" className="text-sm font-semibold">
              Alamat
            </Label>
            <Input
              id="guardian-address"
              {...register("address")}
              maxLength={255}
              disabled={isSaving}
              placeholder="Contoh: Jl. Merdeka No. 1, Jakarta"
              className="h-11"
            />
            {errors.address && <p className="text-xs font-medium text-red-500">{errors.address.message}</p>}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="h-10 px-4 text-sm font-semibold">
              Batal
            </Button>
            <Button type="submit" disabled={isSaving} className="h-10 bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isSaving ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Guardian"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
