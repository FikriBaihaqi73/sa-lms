import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ClassroomConfig } from "../types";

interface ClassroomFilterBarProps {
	config: ClassroomConfig;
	search: string;
	onSearchChange: (value: string) => void;
	buildings: string[];
	floors: string[];
	buildingValue: string;
	floorValue: string;
	onBuildingChange: (value: string) => void;
	onFloorChange: (value: string) => void;
}

export function ClassroomFilterBar({
	config,
	search,
	onSearchChange,
	buildings,
	floors,
	buildingValue,
	floorValue,
	onBuildingChange,
	onFloorChange,
}: ClassroomFilterBarProps) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
			<div className="flex flex-col gap-3 md:flex-row">
				<div className="relative flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
					<Input
						value={search}
						onChange={(event) => onSearchChange(event.target.value)}
						placeholder="Cari kode, nama ruangan, gedung..."
						className="h-10 border-slate-200 bg-white pl-9 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
					/>
				</div>
				<div className="flex gap-3">
					<select
						className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
						value={buildingValue}
						disabled={!config.buildingFloorFilters}
						onChange={(event) => onBuildingChange(event.target.value)}
					>
						<option value="semua">Semua gedung</option>
						{buildings.map((building) => (
							<option key={building} value={building}>
								{building}
							</option>
						))}
					</select>
					<select
						className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
						value={floorValue}
						disabled={!config.buildingFloorFilters}
						onChange={(event) => onFloorChange(event.target.value)}
					>
						<option value="semua">Semua lantai</option>
						{floors.map((floor) => (
							<option key={floor} value={floor}>
								{floor}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
}
