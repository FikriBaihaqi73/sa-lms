import { BookOpenCheck, Plus } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { ApiError } from "@/lib/api";
import {
	useCreateTeachingJournal,
	useDeleteTeachingJournal,
	useSchedulesOptions,
	useTeachingJournals,
	useUpdateTeachingJournal,
} from "../hooks";
import type { TeachingJournalFormValues } from "../schemas";
import type { ScheduleOption, TeachingJournal } from "../types";
import { TeachingJournalDeleteDialog } from "./teaching-journal-delete-dialog";
import { TeachingJournalDetailDialog } from "./teaching-journal-detail-dialog";
import { TeachingJournalDialog } from "./teaching-journal-dialog";
import { TeachingJournalFilter } from "./teaching-journal-filter";
import { TeachingJournalStats } from "./teaching-journal-stats";
import { TeachingJournalTable } from "./teaching-journal-table";

function parseErrorMessage(err: unknown): string {
	if (err instanceof ApiError) {
		if (err.status === 403) {
			return "Akses ditolak: Operasi penulisan jurnal mengajar dibatasi sesuai hak akses.";
		}
		if (err.status === 404) {
			return "Jadwal atau data jurnal mengajar tidak ditemukan.";
		}
		if (err.fieldErrors.length > 0) {
			return `${err.message}: ${err.fieldErrors
				.map(({ field, message }) => `${field || "input"} - ${message}`)
				.join("; ")}`;
		}
		return err.message;
	}
	if (err instanceof Error) return err.message;
	return "Terjadi kesalahan pada sistem. Silakan coba lagi.";
}

export const TeachingJournalsPage: React.FC = () => {
	// Filter States
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 400);
	const [scheduleId, setScheduleId] = useState("");
	const [date, setDate] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(10);

	// Dialog States
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingJournal, setEditingJournal] = useState<TeachingJournal | null>(
		null,
	);
	const [detailJournal, setDetailJournal] = useState<TeachingJournal | null>(
		null,
	);
	const [deletingJournal, setDeletingJournal] =
		useState<TeachingJournal | null>(null);

	// Queries & Mutations
	const {
		data: journalsResponse,
		isLoading,
		isError,
		refetch,
	} = useTeachingJournals({
		page: currentPage,
		limit: perPage,
		search: debouncedSearch.trim() || undefined,
		schedule_id: scheduleId || undefined,
		journal_date: date || undefined,
	});

	const schedulesOptionsQuery = useSchedulesOptions();
	const scheduleOptions = schedulesOptionsQuery.data ?? [];

	const scheduleMap = useMemo(() => {
		const map: Record<string, ScheduleOption> = {};
		for (const opt of scheduleOptions) {
			map[opt.id] = opt;
		}
		return map;
	}, [scheduleOptions]);

	const createMutation = useCreateTeachingJournal();
	const updateMutation = useUpdateTeachingJournal();
	const deleteMutation = useDeleteTeachingJournal();

	const journals = journalsResponse?.data ?? [];
	const meta = journalsResponse?.meta ?? {
		totalData: 0,
		totalPages: 1,
		currentPage: 1,
		perPage: 10,
	};

	// Metrics Calculation
	const { totalMeetings, uniqueTeachers, uniqueSchedules } = useMemo(() => {
		let meetings = 0;
		const teachers = new Set<string>();
		const schedules = new Set<string>();

		for (const j of journals) {
			if (j.meeting_number) meetings += 1;
			if (j.schedule_id) schedules.add(j.schedule_id);

			const teacher =
				j.schedule?.classSubject?.teacher?.profile?.fullName ??
				scheduleMap[j.schedule_id]?.teacherName ??
				j.createdBy?.name;
			if (teacher) teachers.add(teacher);
		}

		return {
			totalMeetings: Math.max(meetings, journals.length),
			uniqueTeachers: Math.max(teachers.size, journals.length > 0 ? 1 : 0),
			uniqueSchedules: Math.max(schedules.size, journals.length > 0 ? 1 : 0),
		};
	}, [journals, scheduleMap]);

	// Handlers
	const handleOpenCreate = () => {
		setEditingJournal(null);
		setIsDialogOpen(true);
	};

	const handleOpenEdit = (journal: TeachingJournal) => {
		setEditingJournal(journal);
		setIsDialogOpen(true);
	};

	const handleOpenDetail = (journal: TeachingJournal) => {
		setDetailJournal(journal);
	};

	const handleOpenDelete = (journal: TeachingJournal) => {
		setDeletingJournal(journal);
	};

	const handleFormSubmit = async (values: TeachingJournalFormValues) => {
		try {
			if (editingJournal) {
				await updateMutation.mutateAsync({
					id: editingJournal.id,
					data: {
						schedule_id: values.schedule_id,
						meeting_number: values.meeting_number ?? null,
						journal_date: values.journal_date
							? new Date(values.journal_date).toISOString()
							: null,
						topic: values.topic ?? null,
						material: values.material ?? null,
						notes: values.notes ?? null,
					},
				});
				toast.success("Jurnal mengajar berhasil diperbarui.");
			} else {
				await createMutation.mutateAsync({
					schedule_id: values.schedule_id,
					meeting_number: values.meeting_number ?? null,
					journal_date: values.journal_date
						? new Date(values.journal_date).toISOString()
						: null,
					topic: values.topic ?? null,
					material: values.material ?? null,
					notes: values.notes ?? null,
				});
				toast.success("Jurnal mengajar berhasil ditambahkan.");
			}
			setIsDialogOpen(false);
			setEditingJournal(null);
		} catch (err) {
			toast.error(parseErrorMessage(err));
		}
	};

	const handleDeleteConfirm = async () => {
		if (!deletingJournal) return;
		try {
			await deleteMutation.mutateAsync(deletingJournal.id);
			toast.success("Jurnal mengajar berhasil dihapus.");
			setDeletingJournal(null);
		} catch (err) {
			toast.error(parseErrorMessage(err));
		}
	};

	const handleResetFilters = () => {
		setSearch("");
		setScheduleId("");
		setDate("");
		setCurrentPage(1);
	};

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
			<div className="mx-auto max-w-7xl space-y-6">
				{/* Header Halaman (1:1 Dark Mode) */}
				<header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<div className="mb-2 flex items-center gap-2 text-blue-600 dark:text-blue-400">
							<BookOpenCheck className="size-5" />
							<span className="text-xs font-bold uppercase tracking-wider">
								AKTIVITAS AKADEMIK
							</span>
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
							Jurnal Mengajar
						</h1>
						<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
							Catat dan pantau aktivitas pelaksanaan pembelajaran di setiap
							pertemuan kelas.
						</p>
					</div>

					<Button
						type="button"
						onClick={handleOpenCreate}
						className="bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-blue-700"
					>
						<Plus className="mr-1.5 size-4" />
						Tambah Jurnal
					</Button>
				</header>

				{/* 4 Kartu Metrik Ringkasan */}
				<TeachingJournalStats
					totalJournals={meta.totalData}
					totalMeetings={totalMeetings}
					uniqueTeachers={uniqueTeachers}
					uniqueSchedules={uniqueSchedules}
					isLoading={isLoading}
				/>

				{/* Bar Filter & Pencarian */}
				<TeachingJournalFilter
					search={search}
					onSearchChange={(val) => {
						setSearch(val);
						setCurrentPage(1);
					}}
					scheduleId={scheduleId}
					onScheduleChange={(val) => {
						setScheduleId(val);
						setCurrentPage(1);
					}}
					date={date}
					onDateChange={(val) => {
						setDate(val);
						setCurrentPage(1);
					}}
					scheduleOptions={scheduleOptions}
					onReset={handleResetFilters}
				/>

				{/* Tabel Data Jurnal Mengajar */}
				<TeachingJournalTable
					rows={journals}
					totalData={meta.totalData}
					currentPage={currentPage}
					totalPages={Math.max(meta.totalPages, 1)}
					perPage={perPage}
					isLoading={isLoading}
					isError={isError}
					searchTerm={debouncedSearch}
					scheduleMap={scheduleMap}
					onPageChange={(p) => setCurrentPage(p)}
					onLimitChange={(l) => {
						setPerPage(l);
						setCurrentPage(1);
					}}
					onRetry={() => refetch()}
					onDetail={handleOpenDetail}
					onEdit={handleOpenEdit}
					onDelete={handleOpenDelete}
					onCreateNew={handleOpenCreate}
				/>

				{/* Modal Form Tambah / Ubah */}
				<TeachingJournalDialog
					isOpen={isDialogOpen}
					onClose={() => {
						setIsDialogOpen(false);
						setEditingJournal(null);
					}}
					onSubmit={handleFormSubmit}
					initialData={editingJournal}
					scheduleOptions={scheduleOptions}
					isSubmitting={createMutation.isPending || updateMutation.isPending}
				/>

				{/* Modal Detail Lengkap */}
				<TeachingJournalDetailDialog
					isOpen={Boolean(detailJournal)}
					onClose={() => setDetailJournal(null)}
					journal={detailJournal}
					scheduleMap={scheduleMap}
					onEdit={handleOpenEdit}
				/>

				{/* Dialog Konfirmasi Hapus */}
				<TeachingJournalDeleteDialog
					isOpen={Boolean(deletingJournal)}
					onClose={() => setDeletingJournal(null)}
					onConfirm={handleDeleteConfirm}
					journal={deletingJournal}
					isDeleting={deleteMutation.isPending}
				/>
			</div>
		</main>
	);
};
