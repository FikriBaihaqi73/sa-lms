import { AlertCircle, Edit2, Trash2, UserRound } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import type { User } from "../types";

interface UsersTableProps {
	users: User[];
	isLoading: boolean;
	isError: boolean;
	error?: unknown;
	onRetry?: () => void;
	onEdit: (user: User) => void;
	onDelete: (user: User) => void;
	searchTerm: string;
	total: number;
	userStatus?: "active" | "deleted";
}

function formatLastLogin(value: string | null): string {
	if (!value) return "Belum login";
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? "Belum login"
		: new Intl.DateTimeFormat("id-ID", {
				dateStyle: "medium",
				timeStyle: "short",
			}).format(date);
}

export const UsersTable: React.FC<UsersTableProps> = ({
	users,
	isLoading,
	isError,
	error,
	onRetry,
	onEdit,
	onDelete,
	searchTerm,
	total,
	userStatus = "active",
}) => {
	if (isLoading) {
		return (
			<div className="space-y-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
				{[1, 2, 3, 4, 5].map((item) => (
					<div
						key={item}
						className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60"
					/>
				))}
			</div>
		);
	}

	if (isError) {
		const errorMsg =
			error instanceof Error
				? error.message
				: "Gagal memuat data pengguna dari server.";
		const isAuthError =
			errorMsg.toLowerCase().includes("token") ||
			errorMsg.toLowerCase().includes("authentication") ||
			errorMsg.toLowerCase().includes("401");

		return (
			<div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
				<AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
				<p className="font-semibold text-base">
					{isAuthError
						? "Sesi Masuk Telah Berakhir"
						: "Gagal Memuat Data Pengguna"}
				</p>
				<p className="mt-1 text-sm opacity-90 max-w-md mx-auto">
					{isAuthError
						? "Sesi Anda telah berakhir. Silakan masuk kembali."
						: errorMsg}
				</p>
				<div className="mt-4 flex items-center justify-center gap-2">
					{onRetry && (
						<Button
							variant="outline"
							size="sm"
							onClick={onRetry}
							className="bg-white dark:bg-slate-900"
						>
							Coba Lagi
						</Button>
					)}
					{isAuthError && (
						<Button
							size="sm"
							onClick={() => {
								localStorage.clear();
								window.location.href = "/login";
							}}
							className="bg-red-600 text-white hover:bg-red-700"
						>
							Masuk Kembali
						</Button>
					)}
				</div>
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
				<UserRound className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
				<p className="text-base font-semibold text-slate-800 dark:text-slate-200">
					{userStatus === "deleted"
						? searchTerm
							? "Pengguna terhapus tidak ditemukan untuk pencarian ini"
							: "Tidak ada data pengguna yang dihapus"
						: searchTerm
							? "Pengguna tidak ditemukan untuk pencarian ini"
							: "Belum ada data pengguna"}
				</p>
				<p className="mt-1 text-sm">
					{userStatus === "deleted"
						? "Semua pengguna saat ini berstatus aktif."
						: searchTerm
							? "Coba gunakan kata kunci lain."
							: 'Klik tombol "Tambah Pengguna" untuk membuat data pertama.'}
				</p>
			</div>
		);
	}

	const isDeletedView = userStatus === "deleted";

	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[900px] text-left text-sm">
					<thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
						<tr>
							<th className="px-5 py-3.5">Pengguna</th>
							<th className="px-5 py-3.5">Email</th>
							<th className="px-5 py-3.5">Peran</th>
							<th className="px-5 py-3.5">Institusi</th>
							<th className="px-5 py-3.5">Status</th>
							<th className="px-5 py-3.5">Login Terakhir</th>
							<th className="px-5 py-3.5 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
						{users.map((user) => {
							const profile = user.profile?.[0];
							const isUserDeleted = Boolean(user.deleted_at) || isDeletedView;

							return (
								<tr
									key={user.id}
									className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
								>
									<td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
										{profile?.fullName || "-"}
									</td>
									<td className="px-5 py-4 text-slate-600 dark:text-slate-400">
										{user.email}
									</td>
									<td className="px-5 py-4">
										{profile?.role?.name ? (
											<span className="inline-flex rounded-md border border-blue-200/60 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/60 dark:text-blue-400">
												{profile.role.name}
											</span>
										) : (
											<span className="text-slate-400 dark:text-slate-600">
												-
											</span>
										)}
									</td>
									<td className="px-5 py-4 text-slate-600 dark:text-slate-400">
										<div>{profile?.institution?.name || "-"}</div>
										{profile?.institution?.shortName && (
											<div className="text-xs text-slate-400 dark:text-slate-500">
												{profile.institution.shortName}
											</div>
										)}
									</td>
									<td className="px-5 py-4">
										{isUserDeleted ? (
											<span className="inline-flex rounded-full border border-red-300 bg-red-100/80 px-2.5 py-1 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-400">
												Dihapus
											</span>
										) : (
											<span
												className={
													user.is_active
														? "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/50 dark:text-emerald-400"
														: "inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/50 dark:text-amber-400"
												}
											>
												{user.is_active ? "Aktif" : "Tidak Aktif"}
											</span>
										)}
									</td>
									<td className="px-5 py-4 text-slate-600 dark:text-slate-400">
										{formatLastLogin(user.last_login)}
									</td>
									<td className="px-5 py-4 text-right">
										{isDeletedView ? (
											<span className="text-xs font-medium text-slate-400 dark:text-slate-500 italic">
												Terhapus
											</span>
										) : (
											<div className="flex items-center justify-end gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
												<Button
													variant="outline"
													size="sm"
													onClick={() => onEdit(user)}
													className="h-8 px-2.5 border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/50 dark:hover:text-blue-400"
													title="Ubah Pengguna"
												>
													<Edit2 className="mr-1 h-3.5 w-3.5" />
													Ubah
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => onDelete(user)}
													className="h-8 px-2.5 border-slate-200 text-red-600 hover:border-red-200 hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-950/50"
													title="Hapus Pengguna"
												>
													<Trash2 className="mr-1 h-3.5 w-3.5" />
													Hapus
												</Button>
											</div>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
				<span>
					Menampilkan {users.length} dari {total} pengguna
				</span>
				<span className="font-mono text-slate-400 dark:text-slate-500">
					Direktori Pengguna
				</span>
			</div>
		</div>
	);
};
