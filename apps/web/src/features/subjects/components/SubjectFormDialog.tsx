import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Department } from "@/features/departments/types";
import { ApiError } from "@/lib/api";
import { subjectSchema, type SubjectFormValues } from "../schemas/subjectSchema";
import type { Subject } from "../types";
import { getSubjectErrorMessage } from "../utils/subject-error";

interface SubjectFormDialogProps {
	open: boolean;
	mode: "create" | "edit";
	subject?: Subject | null;
	departments: Department[];
	departmentsError?: string;
	isSaving: boolean;
	isLoadingInstitution: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (values: SubjectFormValues) => Promise<void>;
}

const FORM_FIELDS = ["code", "name", "credits", "description", "departmentId"] as const;

export function SubjectFormDialog({
	open,
	mode,
	subject,
	departments,
	departmentsError,
	isSaving,
	isLoadingInstitution,
	onOpenChange,
	onSubmit,
}: SubjectFormDialogProps) {
	const form = useForm<SubjectFormValues>({
		resolver: zodResolver(subjectSchema),
		defaultValues: {
			code: subject?.code ?? "",
			name: subject?.name ?? "",
			credits: subject?.credits ?? undefined,
			description: subject?.description ?? "",
			departmentId: subject?.departmentId ?? "",
		},
	});

	const submit = form.handleSubmit(async (values) => {
		form.clearErrors();
		try {
			await onSubmit(values);
		} catch (error) {
			let hasFieldError = false;
			if (error instanceof ApiError) {
				for (const fieldError of error.fieldErrors) {
					const field = FORM_FIELDS.find((candidate) => candidate === fieldError.field);
					if (field) {
						form.setError(field, { type: "server", message: fieldError.message });
						hasFieldError = true;
					}
				}
			}
			if (!hasFieldError) {
				form.setError("root.server", {
					type: "server",
					message: getSubjectErrorMessage(error),
				});
			}
		}
	});

	const isBusy = isSaving || (mode === "create" && isLoadingInstitution);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{mode === "edit" ? "Ubah Mata Pelajaran" : "Tambah Mata Pelajaran"}
					</DialogTitle>
					<DialogDescription>
						Isi informasi mata pelajaran di bawah ini.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={submit} className="space-y-4">
					{form.formState.errors.root?.server?.message && (
						<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
							{form.formState.errors.root.server.message}
						</p>
					)}

					<div className="space-y-2">
						<Label htmlFor="subject-code">Kode Mata Pelajaran</Label>
						<Input
							id="subject-code"
							maxLength={100}
							placeholder="Contoh: MAT-101"
							aria-invalid={Boolean(form.formState.errors.code)}
							{...form.register("code")}
						/>
						{form.formState.errors.code?.message && (
							<p className="text-xs text-red-600">{form.formState.errors.code.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="subject-name">Nama Mata Pelajaran</Label>
						<Input
							id="subject-name"
							maxLength={255}
							placeholder="Contoh: Matematika"
							aria-invalid={Boolean(form.formState.errors.name)}
							{...form.register("name")}
						/>
						{form.formState.errors.name?.message && (
							<p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="subject-credits">Kredit <span className="font-normal text-muted-foreground">(opsional)</span></Label>
						<Input
							id="subject-credits"
							type="number"
							min="0"
							step="1"
							placeholder="Contoh: 3"
							aria-invalid={Boolean(form.formState.errors.credits)}
							{...form.register("credits", {
								setValueAs: (value: string) => value === "" ? undefined : Number(value),
							})}
						/>
						{form.formState.errors.credits?.message && (
							<p className="text-xs text-red-600">{form.formState.errors.credits.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="subject-department">Departemen <span className="font-normal text-muted-foreground">(opsional)</span></Label>
		<Select
							id="subject-department"
							aria-invalid={Boolean(form.formState.errors.departmentId)}
							{...form.register("departmentId")}
						>
							<option value="">Tanpa departemen</option>
							{departments.map((department) => (
								<option key={department.id} value={department.id}>{department.name}</option>
							))}
		</Select>
						{departmentsError && <p className="text-xs text-amber-600">{departmentsError}</p>}
						{form.formState.errors.departmentId?.message && (
							<p className="text-xs text-red-600">{form.formState.errors.departmentId.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="subject-description">Deskripsi <span className="font-normal text-muted-foreground">(opsional)</span></Label>
						<textarea
							id="subject-description"
							maxLength={1000}
							rows={3}
							placeholder="Keterangan mata pelajaran"
							aria-invalid={Boolean(form.formState.errors.description)}
							className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							{...form.register("description")}
						/>
						{form.formState.errors.description?.message && (
							<p className="text-xs text-red-600">{form.formState.errors.description.message}</p>
						)}
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
							Batal
						</Button>
						<Button type="submit" disabled={isBusy}>
							{isBusy && <LoaderCircle className="animate-spin" />}
							{mode === "edit" ? "Simpan Perubahan" : "Simpan Mata Pelajaran"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
