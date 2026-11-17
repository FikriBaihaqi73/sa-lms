import { zodResolver } from "@hookform/resolvers/zod";
import type { MouseEvent } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { examinationFormSchema, type ExaminationFormValues } from "../schemas/examinationSchema";
import type { Examination } from "../types";
import { splitExaminationDateTime } from "../utils/examination-date-time";

interface ExaminationDialogProps {
  open: boolean;
  item?: Examination | null;
  classSubjects: { id: string; label: string }[];
  assignmentTypes: { id: string; name: string }[];
  isSaving: boolean;
  fieldError: { field: string; message: string } | null;
  onFieldChange: () => void;
  onClose: () => void;
  onSave: (values: ExaminationFormValues) => Promise<void>;
}

function openNativePicker(event: MouseEvent<HTMLInputElement>) {
  try { event.currentTarget.showPicker?.(); } catch { /* Browser may reject programmatic picker calls. */ }
}

export function ExaminationDialog({ open, item, classSubjects, assignmentTypes, isSaving, fieldError, onFieldChange, onClose, onSave }: ExaminationDialogProps) {
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<ExaminationFormValues>({ resolver: zodResolver(examinationFormSchema), defaultValues: { classSubjectId: "", assignmentTypeId: "", title: "", description: "", examinationDate: "", examinationTime: "", duration: undefined, maximumScore: undefined } });
  const classSubjectField = register("classSubjectId");
  const assignmentTypeField = register("assignmentTypeId");
  const titleField = register("title");
  const examinationDateField = register("examinationDate");
  const examinationTimeField = register("examinationTime");
  const durationField = register("duration", { setValueAs: (value: string) => value === "" ? undefined : Number(value) });
  const maximumScoreField = register("maximumScore", { setValueAs: (value: string) => value === "" ? undefined : Number(value) });
  const descriptionField = register("description");

  useEffect(() => {
    if (!open) return;
    const dateTime = splitExaminationDateTime(item?.examinationDate);
    reset({ classSubjectId: item?.classSubjectId ?? "", assignmentTypeId: item?.assignmentTypeId ?? "", title: item?.title ?? "", description: item?.description ?? "", examinationDate: dateTime.date, examinationTime: dateTime.time, duration: item?.duration ?? undefined, maximumScore: item?.maximumScore ?? undefined });
  }, [open, item, reset]);

  useEffect(() => {
    if (fieldError?.field) setError(fieldError.field as keyof ExaminationFormValues, { message: fieldError.message });
  }, [fieldError, setError]);

  return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"><DialogHeader className="shrink-0 px-6 pt-6"><DialogTitle>{item ? "Ubah Ujian" : "Tambah Ujian"}</DialogTitle><DialogDescription>Kelola informasi ujian untuk mata pelajaran kelas.</DialogDescription></DialogHeader><form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit(onSave)}><div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
    <label className="block space-y-1 text-sm">Mata Pelajaran Kelas <span className="text-red-500">*</span><Select {...classSubjectField} onChange={(event) => { classSubjectField.onChange(event); onFieldChange(); }}><option value="">Pilih mata pelajaran kelas</option>{classSubjects.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</Select>{errors.classSubjectId && <span className="text-xs text-red-500">{errors.classSubjectId.message}</span>}</label>
    <label className="block space-y-1 text-sm">Jenis Tugas (opsional)<Select {...assignmentTypeField} onChange={(event) => { assignmentTypeField.onChange(event); onFieldChange(); }}><option value="">Tanpa jenis tugas</option>{assignmentTypes.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</Select>{errors.assignmentTypeId && <span className="text-xs text-red-500">{errors.assignmentTypeId.message}</span>}</label>
    <label className="block space-y-1 text-sm">Judul Ujian<Input {...titleField} onChange={(event) => { titleField.onChange(event); onFieldChange(); }} />{errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}</label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-1 text-sm">Tanggal Pelaksanaan<Input type="date" {...examinationDateField} onClick={openNativePicker} onChange={(event) => { examinationDateField.onChange(event); onFieldChange(); }} className="[color-scheme:light] dark:[color-scheme:dark]" />{errors.examinationDate && <span className="text-xs text-red-500">{errors.examinationDate.message}</span>}</label><label className="block space-y-1 text-sm">Jam Pelaksanaan<Input type="time" {...examinationTimeField} onClick={openNativePicker} onChange={(event) => { examinationTimeField.onChange(event); onFieldChange(); }} className="[color-scheme:light] dark:[color-scheme:dark]" />{errors.examinationTime && <span className="text-xs text-red-500">{errors.examinationTime.message}</span>}</label><p className="text-xs text-slate-500 sm:col-span-2">Tanggal dan jam ini menentukan status Akan Datang atau Selesai.</p></div>
    <label className="block space-y-1 text-sm">Durasi (menit)<Input type="number" min="0" {...durationField} onChange={(event) => { durationField.onChange(event); onFieldChange(); }} />{errors.duration && <span className="text-xs text-red-500">{errors.duration.message}</span>}</label>
    <label className="block space-y-1 text-sm">Nilai Maksimum<Input type="number" min="0" max="999.99" step="0.01" {...maximumScoreField} onChange={(event) => { maximumScoreField.onChange(event); onFieldChange(); }} />{errors.maximumScore && <span className="text-xs text-red-500">{errors.maximumScore.message}</span>}</label>
    <label className="block space-y-1 text-sm">Deskripsi<textarea {...descriptionField} onChange={(event) => { descriptionField.onChange(event); onFieldChange(); }} className="min-h-24 w-full rounded-md border bg-transparent p-2 text-sm" /></label>
  </div><DialogFooter className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900"><Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Batal</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Menyimpan..." : item ? "Simpan Perubahan" : "Tambah Ujian"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
