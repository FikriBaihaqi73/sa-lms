import { BookOpen, ChevronLeft, ChevronRight, Pencil, RefreshCw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { Subject } from "../types";

interface SubjectTableProps {
	subjects: Subject[];
	total: number;
	page: number;
	pageSize: number;
	search: string;
	isLoading: boolean;
	isFetching: boolean;
	errorMessage?: string;
	onSearchChange: (search: string) => void;
	onRetry: () => void;
	onPageChange: (page: number) => void;
	onCreate: () => void;
	onEdit: (subject: Subject) => void;
	onDelete: (subject: Subject) => void;
}

export function SubjectTable({
	subjects,
	total,
	page,
	pageSize,
	search,
	isLoading,
	isFetching,
	errorMessage,
	onSearchChange,
	onRetry,
	onPageChange,
	onCreate,
	onEdit,
	onDelete,
}: SubjectTableProps) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	return (
		<section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center">
				<label className="relative flex-1 sm:max-w-md">
					<span className="sr-only">Cari kode atau nama mata pelajaran</span>
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
					<Input
						value={search}
						onChange={(event) => onSearchChange(event.target.value)}
						placeholder="Cari kode atau nama..."
						className="h-10 pl-9"
					/>
				</label>
				{isFetching && <span className="text-xs text-slate-500">Memperbarui data…</span>}
			</div>

			{isLoading ? (
				<div className="space-y-3 p-5" aria-label="Memuat mata pelajaran" aria-busy="true">
					{Array.from({ length: 5 }, (_, index) => (
						<Skeleton key={index} className="h-12 rounded-lg" />
					))}
				</div>
			) : errorMessage ? (
				<div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
					<BookOpen className="size-9 text-red-500" />
					<p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
						Gagal memuat mata pelajaran
					</p>
					<p className="mt-1 max-w-lg text-sm text-slate-500">{errorMessage}</p>
					<Button variant="outline" onClick={onRetry} className="mt-4">
						<RefreshCw className="size-4" /> Coba lagi
					</Button>
				</div>
			) : subjects.length === 0 ? (
				<div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
					<span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
						<BookOpen className="size-6" />
					</span>
					<p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
						{search ? "Tidak ada hasil yang cocok" : "Belum ada mata pelajaran"}
					</p>
					<p className="mt-1 text-sm text-slate-500">
						{search
							? "Coba kata kunci lain."
							: "Tambahkan mata pelajaran pertama untuk institusi Anda."}
					</p>
					{!search && (
						<Button variant="link" onClick={onCreate} className="mt-2 text-blue-700 dark:text-blue-300">
							Tambah Mata Pelajaran
						</Button>
					)}
				</div>
			) : (
				<div className="overflow-x-auto">
					<Table className="min-w-180">
						<TableHeader className="bg-slate-50 text-xs uppercase tracking-wide dark:bg-slate-950/60">
							<TableRow>
								<TableHead>Kode</TableHead>
								<TableHead>Nama Mata Pelajaran</TableHead>
								<TableHead>Kredit</TableHead>
								<TableHead>Departemen</TableHead>
								<TableHead className="text-right">Aksi</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{subjects.map((subject) => (
								<TableRow key={subject.id}>
									<TableCell>
										<span className="rounded-md bg-blue-50 px-2 py-1 font-mono text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
											{subject.code}
										</span>
									</TableCell>
									<TableCell>
										<p className="font-semibold text-slate-900 dark:text-slate-100">{subject.name}</p>
										{subject.description && (
											<p className="mt-0.5 max-w-sm truncate text-xs text-slate-500">
												{subject.description}
											</p>
										)}
									</TableCell>
									<TableCell>{subject.credits ?? "—"}</TableCell>
									<TableCell>{subject.department?.name ?? "—"}</TableCell>
									<TableCell>
										<div className="flex justify-end gap-1">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => onEdit(subject)}
												aria-label={`Ubah ${subject.name}`}
											>
												<Pencil />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => onDelete(subject)}
												aria-label={`Hapus ${subject.name}`}
												className="text-red-600 hover:text-red-700 dark:text-red-400"
											>
												<Trash2 />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
				<span>
					Menampilkan {total ? (page - 1) * pageSize + 1 : 0}–
					{Math.min(page * pageSize, total)} dari {total} mata pelajaran
				</span>
				<div className="flex items-center justify-between gap-3 sm:justify-end">
					<span>Halaman {page} dari {totalPages}</span>
					<div className="flex gap-1">
						<Button
							variant="outline"
							size="icon"
							disabled={page <= 1 || isFetching}
							onClick={() => onPageChange(page - 1)}
							aria-label="Halaman sebelumnya"
						>
							<ChevronLeft />
						</Button>
						<Button
							variant="outline"
							size="icon"
							disabled={page >= totalPages || isFetching}
							onClick={() => onPageChange(page + 1)}
							aria-label="Halaman berikutnya"
						>
							<ChevronRight />
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
