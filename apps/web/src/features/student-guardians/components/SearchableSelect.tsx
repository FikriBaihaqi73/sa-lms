import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, ChevronDown, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  id: string;
  label: string;
  hint?: string;
}

interface SearchableSelectProps {
  label: string;
  value: string;
  valueLabel?: string;
  options: SearchableSelectOption[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSelect: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  emptyText?: string;
  required?: boolean;
}

/**
 * Server-side searchable select with incremental "load more" pagination.
 * Replaces the previous fixed limit=100 dropdowns so records beyond the
 * first page remain selectable.
 */
export function SearchableSelect({
  label,
  value,
  valueLabel,
  options,
  searchTerm,
  onSearchChange,
  onSelect,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  disabled,
  error,
  placeholder,
  emptyText = "Tidak ada data",
  required,
}: SearchableSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const selectedLabel =
    valueLabel ?? options.find((option) => option.id === value)?.label ?? "";

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          autoComplete="off"
          disabled={disabled}
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? "Ketik untuk mencari..."}
          className={cn("h-11 pl-9 pr-9", error && "border-red-500")}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
          aria-label={open ? "Tutup pilihan" : "Buka pilihan"}
        >
          <ChevronDown className="size-4" />
        </button>
        {open && (
          <ul
            id={`${id}-listbox`}
            role="listbox"
            className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            {isLoading && options.length === 0 && (
              <li className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" /> Memuat data...
              </li>
            )}
            {isError && (
              <li className="flex items-center gap-2 px-3 py-2 text-sm text-red-600">
                <AlertCircle className="size-4" /> Gagal memuat data.
              </li>
            )}
            {!isLoading && !isError && options.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-500">{emptyText}</li>
            )}
            {options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.id === value}
                  disabled={disabled}
                  onClick={() => {
                    onSelect(option.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
                    option.id === value &&
                      "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.hint && (
                    <span className="shrink-0 text-xs text-slate-400">
                      {option.hint}
                    </span>
                  )}
                </button>
              </li>
            ))}
            {hasNextPage && (
              <li>
                <button
                  type="button"
                  disabled={isFetchingNextPage}
                  onClick={onLoadMore}
                  className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:text-blue-400 dark:hover:bg-slate-800/60"
                >
                  {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
                  Muat lebih banyak
                </button>
              </li>
            )}
          </ul>
        )}

      </div>
      {selectedLabel && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Dipilih:{" "}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {selectedLabel}
          </span>
        </p>
      )}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
