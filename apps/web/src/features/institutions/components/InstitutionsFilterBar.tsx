import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { InstitutionLevel } from "../types";

interface InstitutionsFilterBarProps {
	search: string;
	onSearchChange: (value: string) => void;
	levelId: string;
	onLevelChange: (value: string) => void;
	levels: InstitutionLevel[];
	isLoading: boolean;
	onRefresh: () => void;
}

export function InstitutionsFilterBar(props: InstitutionsFilterBarProps) {
	const {
		search,
		onSearchChange,
		levelId,
		onLevelChange,
		levels,
		isLoading,
		onRefresh,
	} = props;
	return (
		<div className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
			<div className="relative flex-1 sm:max-w-md">
				<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
				<Input
					type="text"
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Cari nama institusi..."
					className="bg-white pl-9 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
				/>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<Select
					value={levelId}
					onChange={(event) => onLevelChange(event.target.value)}
					className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200"
					aria-label="Filter jenjang"
				>
					<option value="all">Semua Jenjang</option>
					{levels.map((level) => (
						<option key={level.id} value={level.id}>
							{level.name}
						</option>
					))}
				</Select>

				<Button
					variant="outline"
					size="icon"
					type="button"
					onClick={onRefresh}
					disabled={isLoading}
					title="Muat ulang data"
					className="h-10 w-10 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
				>
					<RefreshCw className="size-4" />
				</Button>
			</div>
		</div>
	);
}
