import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Subject } from "../types";

interface AddPrerequisiteDialogProps {
  isOpen: boolean;
  targetSubject: Subject | null;
  candidates: Subject[];
  onClose: () => void;
  onAdd: (prerequisiteId: string) => void;
}

export function AddPrerequisiteDialog({
  isOpen,
  targetSubject,
  candidates,
  onClose,
  onAdd,
}: AddPrerequisiteDialogProps) {
  const [search, setSearch] = useState("");

  const filteredCandidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q),
    );
  }, [candidates, search]);

  if (!isOpen || !targetSubject) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-prereq-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-lg rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2
              id="add-prereq-title"
              className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight"
            >
              Tambah Prasyarat Mata Kuliah
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Untuk mata kuliah:{" "}
              <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                {targetSubject.code}
              </span>{" "}
              - {targetSubject.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode atau nama mata kuliah..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
            />
          </div>
        </div>

        {/* Candidate List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <p className="text-sm font-medium">
                {candidates.length === 0
                  ? "Semua mata kuliah yang tersedia telah ditambahkan sebagai prasyarat."
                  : "Tidak ditemukan mata kuliah yang cocok dengan kata kunci pencarian."}
              </p>
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between gap-3 p-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-600">
                      {candidate.code}
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {candidate.credits} SKS • Sem. {candidate.semester}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {candidate.name}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    {candidate.department}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onAdd(candidate.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-sm border border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors shrink-0 shadow-xs"
                >
                  Pilih
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-sm border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

