import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAssignmentSubmissionsAdminData } from "../hooks";
import {
	type AssignmentSubmissionFilterSchema,
	assignmentSubmissionFilterSchema,
} from "../schemas";
import type {
	AssignmentSubmissionsFilterValues,
	SubmissionPageState,
} from "../types";
import { submissionSummary } from "../utils";
import { AssignmentSubmissionDetailDialog } from "./AssignmentSubmissionDetailDialog";
import { AssignmentSubmissionsFilterBar } from "./AssignmentSubmissionsFilterBar";
import { AssignmentSubmissionsHeader } from "./AssignmentSubmissionsHeader";
import { AssignmentSubmissionsStats } from "./AssignmentSubmissionsStats";
import { AssignmentSubmissionsTable } from "./AssignmentSubmissionsTable";

const filterDefaults: AssignmentSubmissionsFilterValues = {
	year: "",
	classroom: "",
	assignment: "",
	search: "",
};

export interface AssignmentSubmissionsPageProps {
	state?: SubmissionPageState;
}

export const AssignmentSubmissionsPage: React.FC<
	AssignmentSubmissionsPageProps
> = ({ state: customState }) => {
	const { register, control, reset, setValue } =
		useForm<AssignmentSubmissionFilterSchema>({
			defaultValues: filterDefaults,
			resolver: zodResolver(assignmentSubmissionFilterSchema),
		});

	const filters = useWatch({ control });

	const { state: liveState } = useAssignmentSubmissionsAdminData(
		{
			year: filters.year ?? "",
			classroom: filters.classroom ?? "",
			assignment: filters.assignment ?? "",
		},
		customState === undefined,
	);

	const state = customState ?? liveState;
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(5);
	const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
		null,
	);

	const ready = state.kind === "ready" ? state : null;
	const classes =
		ready?.classes.filter((item) => item.yearId === filters.year) ?? [];
	const classroom = classes.find((item) => item.id === filters.classroom);
	const assignments = classroom
		? (ready?.assignments.filter((item) => item.classId === classroom.id) ?? [])
		: [];
	const assignment = assignments.find((item) => item.id === filters.assignment);
	const rows = assignment?.rows ?? [];
	const counts = assignment ? submissionSummary(rows) : null;

	const searchNormalized = (filters.search ?? "")
		.trim()
		.toLocaleLowerCase("id");
	const filteredRows = rows.filter((row) =>
		row.fullName.toLocaleLowerCase("id").includes(searchNormalized),
	);

	const totalPages = Math.max(1, Math.ceil(filteredRows.length / limit));
	const currentPage = Math.min(page, totalPages);
	const paginatedRows = filteredRows.slice(
		(currentPage - 1) * limit,
		currentPage * limit,
	);

	const selectedRow = rows.find((row) => row.studentId === selectedStudentId);

	const emptyMessage =
		state.kind === "blocked"
			? "Data pengumpulan belum tersedia. Silakan hubungi administrator."
			: state.kind === "loading"
				? "Memuat data pengumpulan…"
				: state.kind === "error"
					? "Data pengumpulan gagal dimuat."
					: !assignment
						? "Pilih tahun akademik, kelas, dan tugas untuk melihat pengumpulan."
						: "Tidak ada siswa yang cocok dengan pencarian.";

	const resetPage = () => {
		setPage(1);
		setSelectedStudentId(null);
	};

	const handleYearChange = (yearId: string) => {
		setValue("year", yearId);
		setValue("classroom", "");
		setValue("assignment", "");
		resetPage();
	};

	const handleClassChange = (classId: string) => {
		setValue("classroom", classId);
		setValue("assignment", "");
		resetPage();
	};

	const handleAssignmentChange = (assignmentId: string) => {
		setValue("assignment", assignmentId);
		resetPage();
	};

	const handleSearchChange = (searchTerm: string) => {
		setValue("search", searchTerm);
		resetPage();
	};

	const handleResetFilters = () => {
		reset(filterDefaults);
		resetPage();
	};

	return (
		<section
			className="min-h-screen space-y-6 bg-[#0c1427] p-4 text-slate-100 sm:p-7"
			aria-label="Pengumpulan tugas siswa"
		>
			<AssignmentSubmissionsHeader />

			<AssignmentSubmissionsStats
				counts={counts}
				isLoading={state.kind === "loading"}
			/>

			<AssignmentSubmissionsFilterBar
				register={register}
				ready={ready}
				classes={classes}
				assignments={assignments}
				filters={filters}
				onYearChange={handleYearChange}
				onClassChange={handleClassChange}
				onAssignmentChange={handleAssignmentChange}
				onSearchChange={handleSearchChange}
				onReset={handleResetFilters}
			/>

			<AssignmentSubmissionsTable
				rows={paginatedRows}
				currentPage={currentPage}
				limit={limit}
				totalPages={totalPages}
				totalData={filteredRows.length}
				emptyMessage={emptyMessage}
				isErrorState={state.kind === "error"}
				hasAssignment={Boolean(assignment)}
				onPageChange={setPage}
				onLimitChange={(newLimit) => {
					setLimit(newLimit);
					resetPage();
				}}
				onSelectDetail={setSelectedStudentId}
			/>

			<AssignmentSubmissionDetailDialog
				selected={selectedRow ?? null}
				assignmentTitle={assignment?.title}
				onClose={() => setSelectedStudentId(null)}
			/>
		</section>
	);
};
