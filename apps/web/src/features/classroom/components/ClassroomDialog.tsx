
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiFieldError } from "@/lib/api";

import {
	type ClassroomFormValues,
	classroomFormSchema,
} from "../schemas/classroomSchema";
import type { Classroom } from "../types";

interface ClassroomDialogProps {
	open: boolean;
	classroom: Classroom | null;
	isSaving: boolean;
	serverErrors?: ApiFieldError[];
	onFieldChange?: () => void;
	onClose: () => void;
	onSave: (values: ClassroomFormValues) => Promise<void>;
}

type ClassroomField = keyof ClassroomFormValues;
type NumberField = "floor" | "capacity";

const DEFAULT_VALUES: ClassroomFormValues = {
	roomCode: "",
	roomName: "",
	building: "",
	floor: null,
	capacity: null,
	description: "",
};

const NUMBER_ERROR_MESSAGES: Record<NumberField, string> = {
	floor: "Lantai harus berupa angka bulat, misalnya 0, 1, atau 2.",
	capacity: "Kapasitas harus berupa angka bulat, misalnya 30.",
};

const TEXT_FIELDS = [
	"roomCode",
	"roomName",
	"building",
	"floor",
	"capacity",
	"description",
] as const satisfies readonly ClassroomField[];

export function ClassroomDialog({
	open,
	classroom,
	isSaving,
	serverErrors = [],
	onFieldChange,
	onClose,
	onSave,
}: ClassroomDialogProps) {
	const [badNumberFields, setBadNumberFields] = useState<
		Record<NumberField, boolean>
	>({
		floor: false,
		capacity: false,
	});

	const {
		register,
		handleSubmit,
		reset,
		setError,
		setValue,
		clearErrors,
		formState: { errors },
	} = useForm<ClassroomFormValues>({
		resolver: zodResolver(classroomFormSchema),
		defaultValues: DEFAULT_VALUES,
	});

	const clearFieldError = (field: ClassroomField) => {
		clearErrors(field);
		onFieldChange?.();
	};

	const registerNumber = (field: NumberField) => {
		const registered = register(field, {
			setValueAs: (value: string | number | null | undefined) => {
				if (value === "" || value === null || value === undefined) {
					return null;
				}

				return Number(value);
			},
		});

		return {
			...registered,
			onChange: (event: ChangeEvent<HTMLInputElement>) => {
				if (event.currentTarget.validity.badInput) {
					setBadNumberFields((current) => ({
						...current,
						[field]: true,
					}));

					setValue(field, null, {
						shouldDirty: true,
						shouldValidate: false,
					});

					setError(field, {
						type: "validate",
						message: NUMBER_ERROR_MESSAGES[field],
					});

					onFieldChange?.();
					return;
				}

				setBadNumberFields((current) => ({
					...current,
					[field]: false,
				}));

				void registered.onChange(event);
				clearFieldError(field);
			},
		};
	};

	const registerText = (
		field: "roomCode" | "roomName" | "building" | "description",
	) => {
		const registered = register(field);

		return {
			...registered,
			onChange: (
				event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
			) => {
				void registered.onChange(event);
				clearFieldError(field);
			},
		};
	};

	const fieldMessage = (field: ClassroomField): string | undefined => {
		if (field === "floor" && badNumberFields.floor) {
			return NUMBER_ERROR_MESSAGES.floor;
		}

		if (field === "capacity" && badNumberFields.capacity) {
			return NUMBER_ERROR_MESSAGES.capacity;
		}

		const formError = errors[field]?.message;

		if (formError) {
			return formError;
		}

		return serverErrors.find(
			(serverError) => serverError.field === field,
		)?.message;
	};

	const renderFieldError = (field: ClassroomField) => {
		const message = fieldMessage(field);

		if (!message) {
			return null;
		}

		return (
			<p
				id={`${field}-error`}
				role="alert"
				className="text-xs text-red-600 dark:text-red-400"
			>
				{message}
			</p>
		);
	};

	useEffect(() => {
		if (!open) {
			return;
		}

		setBadNumberFields({
			floor: false,
			capacity: false,
		});

		if (classroom) {
			reset({
				roomCode: classroom.roomCode,
				roomName: classroom.roomName,
				building: classroom.building ?? "",
				floor: classroom.floor ?? null,
				capacity: classroom.capacity ?? null,
				description: classroom.description ?? "",
			});
		} else {
			reset(DEFAULT_VALUES);
		}
	}, [open, classroom, reset]);

	useEffect(() => {
		if (!open) {
			return;
		}

		for (const serverError of serverErrors) {
			if (
				TEXT_FIELDS.includes(serverError.field as ClassroomField)
			) {
				const field = serverError.field as ClassroomField;

				setError(field, {
					type: "server",
					message: serverError.message,
				});
			}
		}
	}, [open, serverErrors, setError]);

	const onSubmit = async (values: ClassroomFormValues) => {
		// Pastikan input angka yang tidak valid tidak bisa lolos submit.
		if (badNumberFields.floor || badNumberFields.capacity) {
			return;
		}

		await onSave(values);
	};

	return (
		<Dialog open={open} onOpenChange={(value) => !value && onClose()}>
			<DialogContent className="max-w-lg dark:bg-slate-900 dark:text-slate-100">
				<DialogHeader>
					<DialogTitle>
						{classroom ? "Ubah Ruang Kelas" : "Tambah Ruang Kelas"}
					</DialogTitle>

					{!classroom && (
						<p className="text-sm text-slate-400">
							Isi data ruangan fisik yang dipakai untuk jadwal pelajaran.
						</p>
					)}
				</DialogHeader>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-4"
					noValidate
				>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="room-code">Kode ruangan *</Label>
							<Input
								id="room-code"
								{...registerText("roomCode")}
								placeholder="Contoh: R-101"
								aria-invalid={!!fieldMessage("roomCode")}
								aria-describedby={
									fieldMessage("roomCode") ? "roomCode-error" : undefined
								}
								className="dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
							/>
							{renderFieldError("roomCode")}
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="room-name">Nama ruangan *</Label>
							<Input
								id="room-name"
								{...registerText("roomName")}
								placeholder="Contoh: Ruang Kelas A"
								aria-invalid={!!fieldMessage("roomName")}
								aria-describedby={
									fieldMessage("roomName") ? "roomName-error" : undefined
								}
								className="dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
							/>
							{renderFieldError("roomName")}
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="building">Gedung (opsional)</Label>
						<Input
							id="building"
							{...registerText("building")}
							placeholder="Nama gedung"
							aria-invalid={!!fieldMessage("building")}
							aria-describedby={
								fieldMessage("building") ? "building-error" : undefined
							}
							className="dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
						/>
						{renderFieldError("building")}
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="floor">Lantai (opsional)</Label>
							<Input
								id="floor"
								type="number"
								min={0}
								step={1}
								{...registerNumber("floor")}
								aria-invalid={!!fieldMessage("floor")}
								aria-describedby={
									fieldMessage("floor") ? "floor-error" : undefined
								}
								className="dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
							/>
							{renderFieldError("floor")}
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="capacity">Kapasitas (opsional)</Label>
							<Input
								id="capacity"
								type="number"
								min={1}
								step={1}
								{...registerNumber("capacity")}
								aria-invalid={!!fieldMessage("capacity")}
								aria-describedby={
									fieldMessage("capacity") ? "capacity-error" : undefined
								}
								className="dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
							/>
							{renderFieldError("capacity")}
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="description">Deskripsi (opsional)</Label>
						<textarea
							id="description"
							{...registerText("description")}
							rows={3}
							placeholder="Fasilitas atau catatan ruangan"
							aria-invalid={!!fieldMessage("description")}
							aria-describedby={
								fieldMessage("description")
									? "description-error"
									: undefined
							}
							className="mt-1 block w-full rounded-md border border-slate-200 bg-transparent px-3 py-1.5 text-sm shadow-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
						/>
						{renderFieldError("description")}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSaving}
							className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
						>
							Batal
						</Button>

						<Button type="submit" disabled={isSaving}>
							{isSaving ? "Menyimpan..." : "Simpan"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
