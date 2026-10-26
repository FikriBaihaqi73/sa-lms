import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Search, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
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
import { Select } from "@/components/ui/select";
import { useCandidateStudents } from "../hooks/useClassStudents";
import {
	type AddClassStudentFormValues,
	addClassStudentSchema,
} from "../schemas/classStudentSchema";
import type { ClassOption } from "../types";

interface ClassStudentDialogProps {
	open: boolean;
	defaultClassId?: string;
	classes: ClassOption[];
	isSaving: boolean;
	onClose: () => void;
	onSave: (
		values: AddClassStudentFormValues,
		className: string,
	) => Promise<void>;
}

export function ClassStudentDialog({
	open,
	defaultClassId,
	classes,
	isSaving,
	onClose,
	onSave,
}: ClassStudentDialogProps) {
	const [studentSearch, setStudentSearch] = useState("");

	const form = useForm<AddClassStudentFormValues>({
		resolver: zodResolver(addClassStudentSchema),
		defaultValues: {
			classId: defaultClassId || classes[0]?.id || "",
			studentIds: [],
		},
	});

	const selectedClassId = form.watch("classId");
	const selectedStudentIds = form.watch("studentIds");

	// Inisialisasi classId saat dialog dibuka
	useEffect(() => {
		if (open) {
			const initialClass = defaultClassId || classes[0]?.id || "";
			form.reset({
				classId: initialClass,
				studentIds: [],
			});
			setStudentSearch("");
		}
	}, [open, defaultClassId, classes, form]);

	// Ambil kandidat siswa untuk kelas terpilih
	const candidatesQuery = useCandidateStudents(selectedClassId, open);
	const candidates = candidatesQuery.data ?? [];

	// Ganti kelas mengosongkan pilihan siswa
	const handleClassChange = (newClassId: string) => {
		form.setValue("classId", newClassId);
		form.setValue("studentIds", []);
	};

	// Filter kandidat berdasarkan kata kunci pencarian
	const filteredCandidates = useMemo(() => {
		if (!studentSearch.trim()) return candidates;
		const q = studentSearch.toLowerCase();
		return candidates.filter(
			(c) =>
				c.fullName.toLowerCase().includes(q) ||
				c.studentNumber.toLowerCase().includes(q),
		);
	}, [candidates, studentSearch]);

	const toggleStudent = (id: string) => {
		const current = form.getValues("studentIds") || [];
		if (current.includes(id)) {
			form.setValue(
				"studentIds",
				current.filter((item) => item !== id),
				{ shouldValidate: true },
			);
		} else {
			form.setValue("studentIds", [...current, id], {
				shouldValidate: true,
			});
		}
	};

	const handleSelectAllFiltered = () => {
		const current = new Set(form.getValues("studentIds") || []);
		const allFilteredSelected = filteredCandidates.every((c) =>
			current.has(c.id),
		);

		if (allFilteredSelected) {
			// Hapus pilihan yang ada di filtered
			const toRemove = new Set(filteredCandidates.map((c) => c.id));
			form.setValue(
				"studentIds",
				Array.from(current).filter((id) => !toRemove.has(id)),
				{ shouldValidate: true },
			);
		} else {
			// Tambahkan semua yang ada di filtered
			for (const c of filteredCandidates) {
				current.add(c.id);
			}
			form.setValue("studentIds", Array.from(current), {
				shouldValidate: true,
			});
		}
	};

	const onSubmit = async (values: AddClassStudentFormValues) => {
		const targetClass = classes.find((c) => c.id === values.classId);
		const className = targetClass?.name || "Kelas";
		await onSave(values, className);
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-xl">
				<DialogHeader className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
					<DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
						<UserPlus className="size-5 text-blue-600" />
						Tambah Siswa ke Kelas
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
						Pilih kelas dan tentukan siswa yang akan ditempatkan.
					</DialogDescription>
				</DialogHeader>

				{classes.length === 0 ? (
					/* Kondisi 5a: Belum ada kelas */
					<div className="p-8 text-center">
						<p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
							Belum ada kelas. Buat kelas dulu di halaman Kelas.
						</p>
						<div className="mt-4">
							<Link
								to="/classes"
								onClick={onClose}
								className="inline-flex h-9 items-center rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
							>
								Menuju Halaman Kelas
							</Link>
						</div>
					</div>
				) : (
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col overflow-hidden"
					>
						<div className="space-y-4 overflow-y-auto px-6 py-4">
							{/* Dropdown Kelas */}
							<div>
								<label
									htmlFor="dialog-class-select"
									className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
								>
									Target Kelas <span className="text-red-500">*</span>
								</label>
								<Select
									id="dialog-class-select"
									value={selectedClassId}
									onChange={(e) => handleClassChange(e.target.value)}
									className="h-10 dark:bg-slate-950"
								>
									{classes.map((c) => (
										<option key={c.id} value={c.id}>
											{c.name} {c.academicYear ? `(TA ${c.academicYear})` : ""}
										</option>
									))}
								</Select>
								{form.formState.errors.classId && (
									<p className="mt-1 text-xs text-red-500">
										{form.formState.errors.classId.message}
									</p>
								)}
							</div>

							{/* Kolom Cari Siswa */}
							<div>
								<label
									htmlFor="dialog-student-search"
									className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
								>
									Cari Siswa
								</label>
								<div className="relative">
									<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
									<Input
										id="dialog-student-search"
										type="search"
										value={studentSearch}
										onChange={(e) => setStudentSearch(e.target.value)}
										placeholder="Ketik nama atau nomor induk siswa..."
										className="h-9 pl-9 text-xs dark:bg-slate-950"
									/>
								</div>
							</div>

							{/* Daftar Siswa Kandidat */}
							<div>
								<div className="mb-2 flex items-center justify-between">
									<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
										Pilih Siswa ({selectedStudentIds.length} dipilih)
									</span>
									{filteredCandidates.length > 0 && (
										<button
											type="button"
											onClick={handleSelectAllFiltered}
											className="text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
										>
											{filteredCandidates.every((c) =>
												selectedStudentIds.includes(c.id),
											)
												? "Batal pilih semua"
												: "Pilih semua hasil"}
										</button>
									)}
								</div>

								<div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-950/40">
									{candidatesQuery.isPending ? (
										<div className="space-y-2 p-3">
											<div className="h-6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
											<div className="h-6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
											<div className="h-6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
										</div>
									) : candidates.length === 0 ? (
										/* Kondisi 5b/c: Kosong */
										<div className="p-6 text-center text-xs text-slate-500">
											<p className="font-semibold text-slate-700 dark:text-slate-300">
												Tidak ada siswa yang bisa ditambahkan
											</p>
											<p className="mt-1 text-slate-400">
												Semua siswa sudah terdaftar di kelas ini atau belum ada
												data siswa di institusi.
											</p>
											<Link
												to="/students"
												onClick={onClose}
												className="mt-2 inline-block font-semibold text-blue-600 hover:underline"
											>
												Buka Halaman Siswa &rarr;
											</Link>
										</div>
									) : filteredCandidates.length === 0 ? (
										<div className="p-4 text-center text-xs text-slate-400">
											Tidak ada siswa yang cocok dengan kata kunci pencarian.
										</div>
									) : (
										<div className="divide-y divide-slate-100 dark:divide-slate-800/60">
											{filteredCandidates.map((student) => {
												const isChecked = selectedStudentIds.includes(
													student.id,
												);
												return (
													<label
														key={student.id}
														className={`flex cursor-pointer items-center justify-between rounded-md p-2 transition hover:bg-slate-100 dark:hover:bg-slate-900 ${
															isChecked
																? "bg-blue-50/60 dark:bg-blue-950/30"
																: ""
														}`}
													>
														<div className="flex items-center gap-2.5 min-w-0">
															<input
																type="checkbox"
																checked={isChecked}
																onChange={() => toggleStudent(student.id)}
																className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
															/>
															<div className="min-w-0">
																<p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
																	{student.fullName}
																</p>
																<p className="font-mono text-[11px] text-slate-400">
																	NIM: {student.studentNumber}
																</p>
															</div>
														</div>

														<div className="ml-2 shrink-0 flex items-center gap-1.5">
															{student.isPreviouslyRemoved && (
																<Badge className="border-amber-200 bg-amber-50 text-[10px] text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300">
																	Pernah dikeluarkan
																</Badge>
															)}
															{student.currentClassName && (
																<Badge
																	variant="secondary"
																	className="text-[10px] text-slate-600 dark:text-slate-400"
																>
																	Di kelas {student.currentClassName}
																</Badge>
															)}
														</div>
													</label>
												);
											})}
										</div>
									)}
								</div>

								{form.formState.errors.studentIds && (
									<p className="mt-1 text-xs text-red-500">
										{form.formState.errors.studentIds.message}
									</p>
								)}
							</div>
						</div>

						<DialogFooter className="border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={isSaving}
								className="h-9 text-xs"
							>
								Batal
							</Button>
							<Button
								type="submit"
								disabled={selectedStudentIds.length === 0 || isSaving}
								className="h-9 bg-blue-700 text-xs font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
							>
								{isSaving
									? "Menambahkan..."
									: `Tambahkan ${selectedStudentIds.length} siswa`}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
