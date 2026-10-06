import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_INSTITUTIONS_DATA } from "../api/mockData";
import { InstitutionsFilterBar } from "./InstitutionsFilterBar";
import { InstitutionsStats } from "./InstitutionsStats";
import { InstitutionsTable } from "./InstitutionsTable";

export function InstitutionsPage() {
	const data = MOCK_INSTITUTIONS_DATA;

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-[#0f172a] dark:text-slate-50 sm:p-6">
			<div className="mx-auto max-w-7xl space-y-6">
				<header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900 dark:text-white">
								Institusi
							</h1>
							<span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50/50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/30 dark:text-blue-400">
								{data.total} Terdaftar
							</span>
						</div>
						<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
							Kelola seluruh institusi, status multi-tenant, dan lisensi aktif
							yang terhubung pada LMS.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button
							type="button"
							variant="outline"
							className="h-10 bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:border-slate-700"
						>
							<Upload className="size-4 mr-2" /> Impor Massal
						</Button>
						<Button
							type="button"
							className="h-10 bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
						>
							<Plus className="size-4 mr-2" /> Tambah institusi
						</Button>
					</div>
				</header>

				<InstitutionsStats
					total={data.total}
					active={data.active}
					trial={data.trial}
					totalUsers={data.totalUsers}
					newThisMonth={data.newThisMonth}
					fullyOperationalPercentage={data.fullyOperationalPercentage}
					expiringIn3Days={data.expiringIn3Days}
					sla={data.sla}
				/>

				<div className="space-y-4">
					<InstitutionsFilterBar />
					<InstitutionsTable rows={data.institutions} totalCount={data.total} />
				</div>
			</div>
		</main>
	);
}
