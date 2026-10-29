import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useDebounce } from "@/hooks/useDebounce";
import { ApiError } from "@/lib/api";
import { classroomConfig } from "../config";
import {
	useClassrooms,
	useCreateClassroom,
	useDeleteClassroom,
	useUpdateClassroom,
} from "../hooks/useClassroom";
import type { ClassroomFormValues } from "../schemas/classroomSchema";
import type { Classroom, CreateClassroomInput } from "../types";
import { ClassroomDialog } from "./ClassroomDialog";
import { ClassroomFilterBar } from "./ClassroomFilterBar";
import { ClassroomHeader } from "./ClassroomHeader";
import { ClassroomStats } from "./ClassroomStats";
import { ClassroomTable } from "./ClassroomTable";
import { DeleteClassroomDialog } from "./DeleteClassroomDialog";

function errorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		if (error.status === 500) {
			return "Terjadi kesalahan pada server. Silakan coba lagi atau hubungi administrator.";
		}
		if (error.status === 409 || error.status === 422) {
			return "Kode ruangan sudah digunakan. Silakan gunakan kode lain.";
		}
		return error.message;
	}
	if (error instanceof Error) return error.message;
	return "Terjadi kesalahan. Silakan coba lagi.";
}

function normalizeOptionalString(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed === "" ? undefined : trimmed;
}

function toCreatePayload(
	values: ClassroomFormValues,
	institutionId: string,
): CreateClassroomInput {
	return {
		institutionId,
		roomCode: values.roomCode.trim().toUpperCase(),
		roomName: values.roomName.trim(),
		building: normalizeOptionalString(values.building),
		floor: values.floor,
		capacity: values.capacity,
		description: normalizeOptionalString(values.description),
	};
}

export function ClassroomPage() {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search);
	const [currentPage, setCurrentPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [isAdding, setIsAdding] = useState(false);
	const [editing, setEditing] = useState<Classroom | null>(null);
	const [deleting, setDeleting] = useState<Classroom | null>(null);
	const [notice, setNotice] = useState<{
		kind: "success" | "error";
		message: string;
	} | null>(null);
	const [selectedBuilding, setSelectedBuilding] = useState("semua");
	const [selectedFloor, setSelectedFloor] = useState("semua");

	const { profile } = useProfile();

	const institutionId = profile?.institution?.id;

	const listQuery = useClassrooms({
		page: currentPage,
		limit,
		search: debouncedSearch.trim(),
	});

	const createMutation = useCreateClassroom();
	const updateMutation = useUpdateClassroom();
	const deleteMutation = useDeleteClassroom();

	const rows = listQuery.data?.data ?? [];
	const meta = listQuery.data?.meta ?? null;

	const buildings = useMemo(() => {
		const set = new Set<string>();
		rows.forEach((item) => {
			if (item.building) set.add(item.building);
		});
		return Array.from(set).sort();
	}, [rows]);

	const floors = useMemo(() => {
		const set = new Set<string>();
		rows.forEach((item) => {
			if (item.floor !== null && item.floor !== undefined && item.floor >= 0) {
				set.add(String(item.floor));
			}
		});
		return Array.from(set).sort((a, b) => Number(a) - Number(b));
	}, [rows]);

	const usedRooms = rows.length;

	const filteredRows = useMemo(() => {
		if (selectedBuilding === "semua" && selectedFloor === "semua") {
			return rows;
		}
		return rows.filter((item) => {
			const matchBuilding =
				selectedBuilding === "semua" || item.building === selectedBuilding;
			const matchFloor =
				selectedFloor === "semua" || String(item.floor ?? "") === selectedFloor;
			return matchBuilding && matchFloor;
		});
	}, [rows, selectedBuilding, selectedFloor]);

	useEffect(() => {
		if (!notice) return;
		const timer = window.setTimeout(() => setNotice(null), 5000);
		return () => window.clearTimeout(timer);
	}, [notice]);

	const handleCreate = async (values: ClassroomFormValues) => {
		if (!institutionId) {
			toast.error(
				"Data institusi tidak ditemukan. Silakan muat ulang halaman.",
			);
			return;
		}
		try {
			await createMutation.mutateAsync(toCreatePayload(values, institutionId));
			setIsAdding(false);
			setCurrentPage(1);
			setNotice({ kind: "success", message: "Ruang kelas ditambahkan" });
			toast.success("Ruang kelas ditambahkan");
		} catch (error) {
			setNotice({ kind: "error", message: errorMessage(error) });
			toast.error(errorMessage(error));
		}
	};

	const handleUpdate = async (values: ClassroomFormValues) => {
		if (!editing || !institutionId) return;
		try {
			await updateMutation.mutateAsync({
				id: editing.id,
				input: {
					roomCode: values.roomCode.trim().toUpperCase(),
					roomName: values.roomName.trim(),
					building: normalizeOptionalString(values.building),
					floor: values.floor,
					capacity: values.capacity,
					description: normalizeOptionalString(values.description),
				},
			});
			setEditing(null);
			setNotice({ kind: "success", message: "Perubahan disimpan" });
			toast.success("Perubahan disimpan");
		} catch (error) {
			setNotice({ kind: "error", message: errorMessage(error) });
			toast.error(errorMessage(error));
		}
	};

	const handleDelete = async () => {
		if (!deleting) return;
		try {
			await deleteMutation.mutateAsync(deleting.id);
			setDeleting(null);
			setNotice({ kind: "success", message: "Ruang kelas dihapus" });
			toast.success("Ruang kelas dihapus");
		} catch (error) {
			setNotice({ kind: "error", message: errorMessage(error) });
			toast.error(errorMessage(error));
		}
	};

	const totalRooms = meta?.total ?? 0;
	const totalCapacity = filteredRows.reduce(
		(sum, item) => sum + (item.capacity ?? 0),
		0,
	);
	const totalBuildings = buildings.length;

	const displayRows = filteredRows;

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
			<div className="mx-auto max-w-7xl space-y-6">
				<ClassroomHeader onOpenCreate={() => setIsAdding(true)} />

				{notice && (
					<div
						role="status"
						className={`flex items-center justify-between rounded-lg border p-4 text-sm font-medium shadow-sm ${
							notice.kind === "success"
								? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
								: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
						}`}
					>
						<span>{notice.message}</span>
						<button
							type="button"
							onClick={() => setNotice(null)}
							className="text-xs font-semibold hover:underline"
						>
							Tutup
						</button>
					</div>
				)}

				<ClassroomStats
					totalRooms={totalRooms}
					totalCapacity={totalCapacity}
					totalBuildings={totalBuildings}
					usedRooms={usedRooms}
					isLoading={listQuery.isPending}
				/>

				<ClassroomFilterBar
					config={classroomConfig}
					search={search}
					onSearchChange={(value) => {
						setSearch(value);
						setCurrentPage(1);
					}}
					buildings={buildings}
					floors={floors}
					buildingValue={selectedBuilding}
					floorValue={selectedFloor}
					onBuildingChange={(value) => {
						setSelectedBuilding(value);
						setCurrentPage(1);
					}}
					onFloorChange={(value) => {
						setSelectedFloor(value);
						setCurrentPage(1);
					}}
				/>

				<ClassroomTable
					rows={displayRows}
					isLoading={listQuery.isPending}
					isError={listQuery.isError}
					searchTerm={debouncedSearch.trim()}
					config={{ scheduleCount: classroomConfig.scheduleCount }}
					onRetry={() => listQuery.refetch()}
					onEdit={setEditing}
					onDelete={setDeleting}
				/>

				{!listQuery.isPending &&
					!listQuery.isError &&
					meta &&
					meta.totalPages > 0 && (
						<div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row">
							<span className="text-sm text-slate-500 dark:text-slate-400">
								Menampilkan {displayRows.length} dari {totalRooms} data
							</span>
							<div className="flex items-center gap-3">
								<label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
									Per halaman
									<select
										value={limit}
										onChange={(event) => {
											setLimit(Number(event.target.value));
											setCurrentPage(1);
										}}
										className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
									>
										<option value={5}>5</option>
										<option value={10}>10</option>
										<option value={20}>20</option>
										<option value={50}>50</option>
									</select>
								</label>
								<div className="flex items-center gap-3">
									<button
										type="button"
										onClick={() =>
											setCurrentPage((page) => Math.max(1, page - 1))
										}
										disabled={currentPage <= 1}
										className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
										aria-label="Halaman sebelumnya"
									>
										Sebelumnya
									</button>
									<button
										type="button"
										onClick={() =>
											setCurrentPage((page) =>
												Math.min(meta.totalPages, page + 1),
											)
										}
										disabled={currentPage >= meta.totalPages}
										className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
										aria-label="Halaman berikutnya"
									>
										Berikutnya
									</button>
									<button
										type="button"
										onClick={() => setCurrentPage(currentPage)}
										className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-700 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
										aria-current="page"
										aria-label={`Halaman ${currentPage}`}
									>
										{currentPage}
									</button>
								</div>
							</div>
						</div>
					)}
			</div>

			<ClassroomDialog
				open={isAdding}
				classroom={null}
				isSaving={createMutation.isPending}
				onClose={() => setIsAdding(false)}
				onSave={handleCreate}
			/>

			<ClassroomDialog
				open={Boolean(editing)}
				classroom={editing}
				isSaving={updateMutation.isPending}
				onClose={() => setEditing(null)}
				onSave={handleUpdate}
			/>

			<DeleteClassroomDialog
				classroom={deleting}
				isDeleting={deleteMutation.isPending}
				onClose={() => setDeleting(null)}
				onConfirm={handleDelete}
			/>
		</main>
	);
}
