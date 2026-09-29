import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { RoleTypeFilter } from "../types";

interface RoleFilterBarProps {
  search: string;
  type: RoleTypeFilter;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: RoleTypeFilter) => void;
}

export function RoleFilterBar({ search, type, onSearchChange, onTypeChange }: RoleFilterBarProps) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input value={search} onChange={(event) => onSearchChange(event.target.value)} className="h-8 border-indigo-100 bg-[#faf9ff] pl-8 text-xs dark:border-slate-700 dark:bg-slate-800" placeholder="Filter roles by name or scope..." aria-label="Search roles" />
      </div>
      <Select value={type} onChange={(event) => onTypeChange(event.target.value as RoleTypeFilter)} className="h-8 w-full border-indigo-100 bg-[#faf9ff] text-xs dark:border-slate-700 dark:bg-slate-800 sm:w-40" aria-label="Filter role type">
        <option value="all">All Types</option>
        <option value="system">System Roles</option>
        <option value="custom">Custom Roles</option>
      </Select>
    </div>
  );
}
