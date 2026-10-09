import { zodResolver } from "@hookform/resolvers/zod";
import {
	AlertCircle,
	Building2,
	Calendar,
	Layers3,
	Loader2,
	Pencil,
	Plus,
	Search,
	ShieldCheck,
	Trash2,
	X,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	useCreateInstitutionLevel,
	useDeleteInstitutionLevel,
	useInstitutionLevels,
	useUpdateInstitutionLevel,
} from "../hooks/useInstitutionLevels";
import type { InstitutionLevel } from "../types";

const formSchema = z.object({
	name: z.string().trim().min(1, "Nama jenjang wajib diisi."),
	description: z.string().trim().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function InstitutionLevelsPage() {
	const {
		data: levels = [],
		isLoading,
		isError,
		error,
	} = useInstitutionLevels();
	const createMutation = useCreateInstitutionLevel();
	const updateMutation = useUpdateInstitutionLevel();
	const deleteMutation = useDeleteInstitutionLevel();

	const [query, setQuery] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<InstitutionLevel | null>(null);
	const [deleteConfirmItem, setDeleteConfirmItem] =
		useState<InstitutionLevel | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { name: "", description: "" },
	});

	// Calculate live dynamic statistics from real backend data
	const totalLevels = levels.length;
	const totalInstitutions = useMemo(() => {
		return levels.reduce(
			(sum, item) => sum + (item._count?.institutions ?? 0),
			0,
		);
	}, [levels]);

	const visibleItems = useMemo(() => {
		return levels.filter((item) => {
			const q = query.toLowerCase().trim();
			if (!q) return true;
			const matchName = item.name.toLowerCase().includes(q);
			const matchDesc = item.description?.toLowerCase().includes(q) ?? false;
			return matchName || matchDesc;
		});
	}, [levels, query]);

	const openCreateModal = () => {
		setEditingItem(null);
		form.reset({ name: "", description: "" });
		setModalOpen(true);
	};

	const openEditModal = (item: InstitutionLevel) => {
		setEditingItem(item);
		form.reset({
			name: item.name,
			description: item.description ?? "",
		});
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		setEditingItem(null);
		form.reset();
	};

	const onSubmit = async (values: FormValues) => {
		try {
			if (editingItem) {
				await updateMutation.mutateAsync({
					id: editingItem.id,
					input: {
						name: values.name,
						description: values.description || undefined,
					},
				});
				setNotice(`Jenjang institusi "${values.name}" berhasil diperbarui.`);
			} else {
				await createMutation.mutateAsync({
					name: values.name,
					description: values.description || undefined,
				});
				setNotice(`Jenjang institusi "${values.name}" berhasil ditambahkan.`);
			}
			closeModal();
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Gagal menyimpan data";
			form.setError("root", { message });
		}
	};

	const handleDelete = async (item: InstitutionLevel) => {
		try {
			await deleteMutation.mutateAsync(item.id);
			setNotice(`Jenjang institusi "${item.name}" berhasil dihapus.`);
			setDeleteConfirmItem(null);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Gagal menghapus data";
			setNotice(message);
			setDeleteConfirmItem(null);
		}
	};

	return (
		<main className="min-h-screen bg-[#F3F5F9] p-5 text-[#1F2937] transition-colors dark:bg-[#0B1220] dark:text-[#E6ECF7] sm:p-8">
			<div className="mx-auto max-w-[1240px]">
				{/* Header */}
				<div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-600/10 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400">
							<ShieldCheck className="size-3.5" />
							Settings Portal
						</span>
						<h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
							Jenjang Institusi
						</h1>
						<p className="mt-1 max-w-xl text-sm leading-5 text-[#6B7280] dark:text-[#94A3B8]">
							Kelola data master jenjang institusi pendidikan yang terintegrasi
							secara dinamis ke seluruh sistem.
						</p>
					</div>
					<button
						type="button"
						onClick={openCreateModal}
						className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-[#3B82F6] dark:hover:bg-blue-500"
					>
						<Plus className="size-4" />
						Tambah Jenjang
					</button>
				</div>

				{/* Notice alert */}
				{notice && (
					<div className="mb-5 flex items-center justify-between rounded-xl border border-blue-200 bg-[#E8F0FE] px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-[#14274A] dark:text-blue-200">
						<span>{notice}</span>
						<button
							type="button"
							onClick={() => setNotice(null)}
							aria-label="Tutup notifikasi"
							className="rounded-lg p-1 hover:bg-blue-200/50 dark:hover:bg-white/10"
						>
							<X className="size-4" />
						</button>
					</div>
				)}

				{/* Dynamic statistics section */}
				<section
					aria-label="Ringkasan jenjang"
					className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2"
				>
					<article className="flex min-h-[96px] items-center gap-4 rounded-xl border border-[#E2E6EE] bg-white p-4 shadow-sm dark:border-[#1E2A44] dark:bg-[#111B2E]">
						<span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
							<Layers3 className="size-6" strokeWidth={1.8} />
						</span>
						<div>
							<p className="font-mono text-2xl font-bold leading-6 tabular-nums">
								{isLoading ? "..." : totalLevels}
							</p>
							<p className="mt-1 text-xs font-medium text-[#6B7280] dark:text-[#94A3B8]">
								Total Jenjang Terdaftar
							</p>
						</div>
					</article>

					<article className="flex min-h-[96px] items-center gap-4 rounded-xl border border-[#E2E6EE] bg-white p-4 shadow-sm dark:border-[#1E2A44] dark:bg-[#111B2E]">
						<span className="grid size-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
							<Building2 className="size-6" strokeWidth={1.8} />
						</span>
						<div>
							<p className="font-mono text-2xl font-bold leading-6 tabular-nums">
								{isLoading ? "..." : totalInstitutions}
							</p>
							<p className="mt-1 text-xs font-medium text-[#6B7280] dark:text-[#94A3B8]">
								Total Institusi yang Menggunakan
							</p>
						</div>
					</article>
				</section>

				{/* Main table section */}
				<section className="overflow-hidden rounded-xl border border-[#E2E6EE] bg-white shadow-sm dark:border-[#1E2A44] dark:bg-[#111B2E]">
					{/* Filter Bar */}
					<div className="flex flex-col gap-3 border-b border-[#E2E6EE] p-4 dark:border-[#1E2A44] sm:flex-row">
						<label className="relative flex-1">
							<span className="sr-only">Cari jenjang</span>
							<Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6B7280] dark:text-[#94A3B8]" />
							<input
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Cari berdasarkan nama atau deskripsi jenjang..."
								className="h-10 w-full rounded-lg border border-[#E2E6EE] bg-transparent pl-10 pr-3 text-sm outline-none placeholder:text-[#6B7280] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 dark:border-[#1E2A44] dark:placeholder:text-[#94A3B8] dark:focus:border-[#3B82F6] dark:focus:ring-blue-500/20"
							/>
						</label>
					</div>

					{/* Loading & Error States */}
					{isLoading ? (
						<div className="flex min-h-[240px] flex-col items-center justify-center p-8 text-slate-500">
							<Loader2 className="size-8 animate-spin text-blue-600" />
							<p className="mt-3 text-sm font-medium">
								Memuat data jenjang institusi...
							</p>
						</div>
					) : isError ? (
						<div className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center text-red-500">
							<AlertCircle className="size-8 text-red-500" />
							<p className="mt-2 text-sm font-semibold">
								Gagal memuat data:{" "}
								{error instanceof Error ? error.message : "Terjadi kesalahan"}
							</p>
						</div>
					) : visibleItems.length === 0 ? (
						<div className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center text-[#6B7280] dark:text-[#94A3B8]">
							<Layers3 className="size-10 stroke-[1.5] text-slate-400" />
							<p className="mt-2 text-sm font-semibold">
								Tidak ada jenjang yang ditemukan
							</p>
							<p className="mt-1 text-xs">
								{query
									? "Coba ubah kata kunci pencarian Anda."
									: "Belum ada data jenjang institusi di database."}
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-[640px] w-full text-left text-sm">
								<thead className="border-b border-[#E2E6EE] bg-slate-50/50 text-xs font-semibold text-[#6B7280] dark:border-[#1E2A44] dark:bg-[#0E1726]/60 dark:text-[#94A3B8]">
									<tr>
										<th className="px-5 py-3.5">Nama Jenjang</th>
										<th className="px-5 py-3.5">Deskripsi</th>
										<th className="px-5 py-3.5 text-center">
											Institusi Terkait
										</th>
										<th className="px-5 py-3.5">Dibuat Pada</th>
										<th className="px-5 py-3.5 text-right">Aksi</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-[#E2E6EE] dark:divide-[#1E2A44]">
									{visibleItems.map((item) => {
										const instCount = item._count?.institutions ?? 0;
										return (
											<tr
												key={item.id}
												className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
											>
												<td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">
													<div className="flex items-center gap-2.5">
														<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold text-xs">
															{item.name.substring(0, 3).toUpperCase()}
														</span>
														<span>{item.name}</span>
													</div>
												</td>
												<td className="px-5 py-4 text-xs text-[#6B7280] dark:text-[#94A3B8] max-w-xs truncate">
													{item.description || "—"}
												</td>
												<td className="px-5 py-4 text-center">
													<span
														className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${
															instCount > 0
																? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
																: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
														}`}
													>
														<Building2 className="size-3" />
														{instCount}
													</span>
												</td>
												<td className="px-5 py-4 text-xs text-[#6B7280] dark:text-[#94A3B8]">
													{item.createdAt ? (
														<span className="inline-flex items-center gap-1.5">
															<Calendar className="size-3" />
															{new Date(item.createdAt).toLocaleDateString(
																"id-ID",
																{
																	day: "numeric",
																	month: "short",
																	year: "numeric",
																},
															)}
														</span>
													) : (
														"—"
													)}
												</td>
												<td className="px-5 py-4 text-right whitespace-nowrap">
													<div className="flex items-center justify-end gap-2">
														<button
															type="button"
															onClick={() => openEditModal(item)}
															className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 transition"
														>
															<Pencil className="size-3.5" />
															Ubah
														</button>
														{instCount > 0 ? (
															<span
																title="Jenjang ini sedang digunakan oleh institusi dan tidak dapat dihapus."
																className="inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 cursor-not-allowed"
															>
																Terpakai
															</span>
														) : (
															<button
																type="button"
																onClick={() => setDeleteConfirmItem(item)}
																className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition"
															>
																<Trash2 className="size-3.5" />
																Hapus
															</button>
														)}
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}

					<div className="border-t border-[#E2E6EE] px-5 py-3.5 text-xs text-[#6B7280] dark:border-[#1E2A44] dark:text-[#94A3B8]">
						Menampilkan {visibleItems.length} dari {levels.length} jenjang
						institusi. Data tersimpan secara real-time di database.
					</div>
				</section>
			</div>

			{/* Modal Dialog for Create & Edit */}
			{modalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
					role="dialog"
					aria-modal="true"
				>
					<section className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E2E6EE] bg-white shadow-2xl dark:border-[#1E2A44] dark:bg-[#111B2E]">
						<div className="flex items-center justify-between border-b border-[#E2E6EE] px-6 py-4 dark:border-[#1E2A44]">
							<div className="flex items-center gap-2.5">
								<span className="grid size-9 place-items-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
									<Layers3 className="size-5" />
								</span>
								<div>
									<h2 className="text-base font-bold text-slate-900 dark:text-white">
										{editingItem
											? "Ubah Jenjang Institusi"
											: "Tambah Jenjang Institusi"}
									</h2>
									<p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
										{editingItem
											? "Perbarui informasi jenjang institusi."
											: "Tambahkan kelompok jenjang baru untuk institusi."}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={closeModal}
								className="rounded-lg p-1.5 text-[#6B7280] hover:bg-slate-100 dark:text-[#94A3B8] dark:hover:bg-white/5"
								aria-label="Tutup dialog"
							>
								<X className="size-5" />
							</button>
						</div>

						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4 p-6"
						>
							{form.formState.errors.root && (
								<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
									{form.formState.errors.root.message}
								</div>
							)}

							<Field
								label="Nama Jenjang"
								hint="Contoh: SD, SMP, SMA, SMK, atau Perguruan Tinggi"
								error={form.formState.errors.name?.message}
							>
								<input
									{...form.register("name")}
									className="h-10 w-full rounded-lg border border-[#E2E6EE] bg-transparent px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-[#1E2A44] dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
									placeholder="Masukkan nama jenjang"
								/>
							</Field>

							<Field
								label="Keterangan / Deskripsi"
								optional
								error={form.formState.errors.description?.message}
							>
								<textarea
									{...form.register("description")}
									className="min-h-24 w-full resize-y rounded-lg border border-[#E2E6EE] bg-transparent p-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-[#1E2A44] dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
									placeholder="Tambahkan keterangan jenjang bila diperlukan"
								/>
							</Field>

							<div className="flex justify-end gap-2 border-t border-[#E2E6EE] pt-4 dark:border-[#1E2A44]">
								<button
									type="button"
									onClick={closeModal}
									className="h-10 rounded-lg border border-[#E2E6EE] px-4 text-sm font-semibold hover:bg-slate-50 dark:border-[#1E2A44] dark:hover:bg-white/5 transition"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={
										createMutation.isPending || updateMutation.isPending
									}
									className="flex h-10 items-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 dark:bg-[#3B82F6] transition"
								>
									{(createMutation.isPending || updateMutation.isPending) && (
										<Loader2 className="size-4 animate-spin" />
									)}
									{editingItem ? "Simpan Perubahan" : "Simpan Jenjang"}
								</button>
							</div>
						</form>
					</section>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{deleteConfirmItem && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
					role="dialog"
					aria-modal="true"
				>
					<div className="w-full max-w-sm rounded-2xl border border-[#E2E6EE] bg-white p-6 shadow-2xl dark:border-[#1E2A44] dark:bg-[#111B2E]">
						<div className="flex items-center gap-3 text-red-600">
							<span className="grid size-10 place-items-center rounded-xl bg-red-50 dark:bg-red-950/50">
								<Trash2 className="size-5" />
							</span>
							<h3 className="text-base font-bold text-slate-900 dark:text-white">
								Hapus Jenjang Institusi?
							</h3>
						</div>
						<p className="mt-3 text-sm text-[#6B7280] dark:text-[#94A3B8]">
							Apakah Anda yakin ingin menghapus jenjang{" "}
							<strong>{deleteConfirmItem.name}</strong>? Tindakan ini tidak
							dapat dibatalkan.
						</p>
						<div className="mt-6 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setDeleteConfirmItem(null)}
								className="h-9 rounded-lg border border-[#E2E6EE] px-3.5 text-xs font-semibold hover:bg-slate-50 dark:border-[#1E2A44] dark:hover:bg-white/5 transition"
							>
								Batal
							</button>
							<button
								type="button"
								disabled={deleteMutation.isPending}
								onClick={() => handleDelete(deleteConfirmItem)}
								className="flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-3.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition"
							>
								{deleteMutation.isPending && (
									<Loader2 className="size-3.5 animate-spin" />
								)}
								Ya, Hapus
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}

function Field({
	label,
	hint,
	optional = false,
	error,
	children,
}: {
	label: string;
	hint?: string;
	optional?: boolean;
	error?: string;
	children: ReactNode;
}) {
	return (
		<div className="block text-sm font-medium">
			<span className="block mb-1.5">
				{label}
				{optional && (
					<span className="ml-1 font-normal text-[#6B7280] dark:text-[#94A3B8]">
						(opsional)
					</span>
				)}
			</span>
			{children}
			{hint && (
				<span className="mt-1 block text-xs font-normal text-[#6B7280] dark:text-[#94A3B8]">
					{hint}
				</span>
			)}
			{error && (
				<span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">
					{error}
				</span>
			)}
		</div>
	);
}
