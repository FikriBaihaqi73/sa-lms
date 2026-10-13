import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { AcademicYear } from "@/features/academic-years/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import { useCreateSemester, useUpdateSemester } from "../hooks/useSemesters";
import { semesterFormSchema, type SemesterFormValues } from "../schemas/semesterSchema";
import type { Semester } from "../types";

interface SemesterDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	semester: Semester | null;
	academicYears: AcademicYear[];
	isAcademicYearsLoading: boolean;
	isAcademicYearsError: boolean;
}

const EMPTY_VALUES: SemesterFormValues = {
	academic_year_id: "",
	name: "",
	start_date: "",
	end_date: "",
	is_active: false,
};

function toDateInputValue(value: string | null): string {
	if (!value) return "";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function toIsoDate(value: string): string {
	return new Date(`${value}T00:00:00.000Z`).toISOString();
}

interface SemesterFormPayload {
	academic_year_id: string;
	name: string;
	start_date?: string;
	end_date?: string;
	is_active: boolean;
}

function toPayload(values: SemesterFormValues): SemesterFormPayload {
	return {
		academic_year_id: values.academic_year_id,
		name: values.name.trim(),
		...(values.start_date ? { start_date: toIsoDate(values.start_date) } : {}),
		...(values.end_date ? { end_date: toIsoDate(values.end_date) } : {}),
		is_active: values.is_active,
	};
}

export function SemesterDialog({
	open,
	onOpenChange,
	semester,
	academicYears,
	isAcademicYearsLoading,
	isAcademicYearsError,
}: SemesterDialogProps) {
	const isEditing = Boolean(semester);
	const form = useForm<SemesterFormValues>({
		resolver: zodResolver(semesterFormSchema),
		defaultValues: EMPTY_VALUES,
	});
	const { mutate: createSemester, isPending: isCreating } = useCreateSemester();
	const { mutate: updateSemester, isPending: isUpdating } = useUpdateSemester();

	useEffect(() => {
		if (!open) return;
		form.reset(semester ? {
			academic_year_id: semester.academic_year_id,
			name: semester.name,
			start_date: toDateInputValue(semester.start_date),
			end_date: toDateInputValue(semester.end_date),
			is_active: semester.is_active,
		} : EMPTY_VALUES);
	}, [form, open, semester]);

	const applyFieldErrors = (error: Error) => {
		if (!(error instanceof ApiError)) return;
		for (const { field, message } of error.fieldErrors) {
			if (field === "academic_year_id" || field === "name" || field === "start_date" || field === "end_date" || field === "is_active") {
				form.setError(field, { type: "server", message });
			}
		}
	};

	const onSubmit = (values: SemesterFormValues) => {
		const payload = toPayload(values);
		if (isEditing && semester) {
			updateSemester({ id: semester.id, input: payload }, {
				onSuccess: () => onOpenChange(false),
				onError: applyFieldErrors,
			});
			return;
		}
		createSemester(payload, {
			onSuccess: () => onOpenChange(false),
			onError: applyFieldErrors,
		});
	};

	const isPending = isCreating || isUpdating;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[520px]">
				<DialogHeader>
					<DialogTitle>{isEditing ? "Edit Semester" : "Tambah Semester"}</DialogTitle>
					<DialogDescription>Lengkapi data semester untuk academic year yang dipilih.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField control={form.control} name="academic_year_id" render={({ field }) => (
							<FormItem>
								<FormLabel>Academic Year</FormLabel>
								<FormControl>
									<Select {...field} disabled={isPending || isAcademicYearsLoading || isAcademicYearsError}>
										<option value="">Pilih academic year</option>
										{academicYears.map((academicYear) => <option key={academicYear.id} value={academicYear.id}>{academicYear.academic_year}</option>)}
									</Select>
								</FormControl>
								{isAcademicYearsLoading && <p className="text-xs text-slate-500">Memuat daftar academic year...</p>}
								{isAcademicYearsError && <p className="text-xs text-red-600">Daftar academic year gagal dimuat.</p>}
								<FormMessage />
							</FormItem>
						)} />
						<FormField control={form.control} name="name" render={({ field }) => (
							<FormItem>
								<FormLabel>Nama Semester</FormLabel>
								<FormControl><Input placeholder="Contoh: Semester Ganjil" {...field} disabled={isPending} /></FormControl>
								<FormMessage />
							</FormItem>
						)} />
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField control={form.control} name="start_date" render={({ field }) => (
								<FormItem><FormLabel>Tanggal Mulai (opsional)</FormLabel><FormControl><Input type="date" {...field} disabled={isPending} /></FormControl><FormMessage /></FormItem>
							)} />
							<FormField control={form.control} name="end_date" render={({ field }) => (
								<FormItem><FormLabel>Tanggal Selesai (opsional)</FormLabel><FormControl><Input type="date" {...field} disabled={isPending} /></FormControl><FormMessage /></FormItem>
							)} />
						</div>
						<FormField control={form.control} name="is_active" render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
								<div className="space-y-0.5"><FormLabel className="text-base">Status Aktif</FormLabel><p className="text-xs text-slate-500">Tandai semester yang sedang digunakan.</p></div>
								<FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} /></FormControl>
							</FormItem>
						)} />
						<DialogFooter className="pt-2">
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Batal</Button>
							<Button type="submit" disabled={isPending || isAcademicYearsLoading || isAcademicYearsError}>{isPending ? "Menyimpan..." : "Simpan"}</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

