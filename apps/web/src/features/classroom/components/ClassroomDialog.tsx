import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import {
	type ClassroomFormValues,
	classroomFormSchema,
} from "../schemas/classroomSchema";
import type { Classroom } from "../types";

interface ClassroomDialogProps {
	open: boolean;
	classroom: Classroom | null;
	isSaving: boolean;
	onClose: () => void;
	onSave: (values: ClassroomFormValues) => Promise<void>;
}

export function ClassroomDialog({
	open,
	classroom,
	isSaving,
	onClose,
	onSave,
}: ClassroomDialogProps) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ClassroomFormValues>({
		resolver: zodResolver(classroomFormSchema),
		defaultValues: {
			roomCode: "",
			roomName: "",
			building: undefined,
			floor: undefined,
			capacity: undefined,
			description: undefined,
		},
	});

	useEffect(() => {
		if (open) {
			if (classroom) {
				reset({
					roomCode: classroom.roomCode,
					roomName: classroom.roomName,
					building: classroom.building ?? undefined,
					floor: classroom.floor ?? undefined,
					capacity: classroom.capacity ?? undefined,
					description: classroom.description ?? undefined,
				});
			} else {
				reset({
					roomCode: "",
					roomName: "",
					building: undefined,
					floor: undefined,
					capacity: undefined,
					description: undefined,
				});
			}
		}
	}, [open, classroom, reset]);

	const onSubmit = async (values: ClassroomFormValues) => {
		await onSave(values);
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="max-w-lg dark:bg-slate-900 dark:text-slate-100">
				<DialogHeader>
					<DialogTitle>
						{classroom ? "Ubah Ruang Kelas" : "Tambah ruang kelas"}
					</DialogTitle>
					{classroom ? null : (
						<p className="text-sm text-slate-400">
							Isi data ruangan fisik yang dipakai untuk jadwal pelajaran.
						</p>
					)}
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<Label htmlFor="room-code">Kode ruangan *</Label>
							<Input
								id="room-code"
								{...register("roomCode")}
								placeholder="Contoh: R-101"
								className="dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
							/>
							{errors.roomCode && (
								<p className="text-xs text-red-600">
									{errors.roomCode.message}
								</p>
							)}
						</div>
						<div>
							<Label htmlFor="room-name">Nama ruangan *</Label>
							<Input
								id="room-name"
								{...register("roomName")}
								placeholder="Contoh: Ruang Kelas A"
								className="dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
							/>
							{errors.roomName && (
								<p className="text-xs text-red-600">
									{errors.roomName.message}
								</p>
							)}
						</div>
					</div>

					<div>
						<Label htmlFor="building">Gedung (opsional)</Label>
						<Input
							id="building"
							{...register("building")}
							placeholder="Nama gedung"
							className="dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
						/>
						{errors.building && (
							<p className="text-xs text-red-600">{errors.building.message}</p>
						)}
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<Label htmlFor="floor">Lantai (opsional)</Label>
							<Input
								id="floor"
								type="number"
								min={0}
								{...register("floor", {
									valueAsNumber: true,
									setValueAs: (value) =>
										typeof value === "number" && Number.isNaN(value)
											? undefined
											: value,
								})}
								className="dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
							/>
							{errors.floor && (
								<p className="text-xs text-red-600">{errors.floor.message}</p>
							)}
						</div>
						<div>
							<Label htmlFor="capacity">Kapasitas (opsional)</Label>
							<Input
								id="capacity"
								type="number"
								min={1}
								{...register("capacity", {
									valueAsNumber: true,
									setValueAs: (value) =>
										typeof value === "number" && Number.isNaN(value)
											? undefined
											: value,
								})}
								className="dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
							/>
							{errors.capacity && (
								<p className="text-xs text-red-600">
									{errors.capacity.message}
								</p>
							)}
						</div>
					</div>

					<div>
						<Label htmlFor="description">Deskripsi (opsional)</Label>
						<textarea
							id="description"
							{...register("description")}
							rows={3}
							placeholder="Fasilitas atau catatan ruangan"
							className="mt-1 block w-full rounded-md border border-slate-200 bg-transparent px-3 py-1.5 text-sm shadow-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
						/>
						{errors.description && (
							<p className="text-xs text-red-600">
								{errors.description.message}
							</p>
						)}
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
