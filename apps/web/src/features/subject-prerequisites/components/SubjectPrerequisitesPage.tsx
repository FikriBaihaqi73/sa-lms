import {
  AlertCircle,
  BookOpen,
  Check,
  ChevronDown,
  Filter,
  GitFork,
  GraduationCap,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSubjectPrerequisitesAuto } from "../hooks/useSubjectPrerequisitesAuto";
import type { FilterPrerequisiteOption } from "../types";
import { AddPrerequisiteDialog } from "./AddPrerequisiteDialog";
import { PrerequisiteItem } from "./PrerequisiteItem";
import { SubjectCard } from "./SubjectCard";

export function SubjectPrerequisitesPage() {
  const {
    subjects,
    selectedSubject,
    selectedSubjectId,
    draftPrerequisites,
    hasUnsavedChanges,
    availableCandidates,
    departments,
    filteredSubjects,
    searchQuery,
    filterPrerequisite,
    selectedDepartment,
    isLoading,
    isError,
    error,
    isSaving,
    setSearchQuery,
    setFilterPrerequisite,
    setSelectedDepartment,
    selectSubject,
    addPrerequisite,
    removePrerequisite,
    saveChanges,
    resetChanges,
    refreshData,
  } = useSubjectPrerequisitesAuto();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Statistics
  const totalSubjects = subjects.length;
  const subjectsWithPrereqs = subjects.filter(
    (s) => s.prerequisiteIds.length > 0,
  ).length;
  const subjectsWithoutPrereqs = totalSubjects - subjectsWithPrereqs;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100/70 dark:bg-[#0B1220] p-4 lg:p-6 space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <GitFork className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Manajemen Prasyarat Mata Kuliah
            </h1>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Kelola hierarki dan mata kuliah prasyarat wajib untuk kurikulum akademik universitas langsung dari database.
          </p>
        </div>

        {/* Quick Stats & Refresh Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={refreshData}
            title="Sinkronkan data dari database"
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            <span>Sinkron DB</span>
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-neutral-500" />
            <span>Total: <strong>{totalSubjects}</strong> Matkul</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-xs font-medium text-blue-700 dark:text-blue-300 shadow-2xs">
            <GitFork className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Bersyarat: <strong>{subjectsWithPrereqs}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-xs font-medium text-neutral-600 dark:text-neutral-400 shadow-2xs">
            <span>Bebas Prasyarat: <strong>{subjectsWithoutPrereqs}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Split-Screen Container */}
      <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-10.5rem)] min-h-[640px] rounded-md border border-neutral-300 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900 shadow-xs">
        {/* ========================================================= */}
        {/* PANEL KIRI (LEBAR 60%): Daftar Mata Kuliah + Search Bar  */}
        {/* ========================================================= */}
        <section
          aria-label="Daftar Mata Kuliah"
          className="w-full lg:w-[60%] flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 overflow-hidden"
        >
          {/* Top Filter & Search Bar */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Daftar Mata Kuliah ({filteredSubjects.length})
              </span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                Klik kartu untuk mengelola prasyarat
              </span>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode matkul atau nama matkul di database..."
                className="w-full pl-9 pr-9 py-2 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 dark:focus:ring-blue-500 transition-colors shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills & Department Selector */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { key: "all", label: "Semua" },
                    { key: "has_prerequisites", label: "Ada Prasyarat" },
                    { key: "no_prerequisites", label: "Tanpa Prasyarat" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilterPrerequisite(tab.key as FilterPrerequisiteOption)}
                    className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors border ${
                      filterPrerequisite === tab.key
                        ? "bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100 shadow-2xs"
                        : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Department Dropdown Filter */}
              {departments.length > 0 && (
                <div className="relative shrink-0">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="appearance-none pl-6 pr-7 py-1 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="all">Semua Program Studi / Jurusan</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} {dept.code ? `(${dept.code})` : ""}
                      </option>
                    ))}
                  </select>
                  <Filter className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Course List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-neutral-400 space-y-2">
                <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  Memuat data mata kuliah dari database...
                </p>
              </div>
            ) : isError ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-red-200 dark:border-red-900/40 rounded-md bg-white/50 dark:bg-neutral-900/50">
                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  Gagal memuat data dari server
                </p>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  {error?.message || "Pastikan Anda sudah login dan server backend berjalan."}
                </p>
                <button
                  type="button"
                  onClick={refreshData}
                  className="mt-3 px-3 py-1.5 text-xs font-medium rounded-sm border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition shadow-2xs"
                >
                  Coba Lagi
                </button>
              </div>
            ) : subjects.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-md bg-white/50 dark:bg-neutral-900/50">
                <BookOpen className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mb-2" />
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Belum ada mata kuliah di database
                </p>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                  Database institusi belum memiliki data mata kuliah. Silakan buat mata kuliah terlebih dahulu di menu mata pelajaran.
                </p>
                <button
                  type="button"
                  onClick={refreshData}
                  className="mt-3 px-3 py-1 text-xs font-medium rounded-sm border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  Sinkronkan Ulang
                </button>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-md bg-white/50 dark:bg-neutral-900/50">
                <Search className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mb-2" />
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Tidak ada mata kuliah yang cocok
                </p>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                  Coba ubah kata kunci pencarian atau sesuaikan filter prasyarat dan program studi.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterPrerequisite("all");
                    setSelectedDepartment("all");
                  }}
                  className="mt-3 px-3 py-1 text-xs font-medium rounded-sm border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              filteredSubjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  isSelected={subject.id === selectedSubjectId}
                  hasDraftEdits={
                    subject.id === selectedSubject?.id && hasUnsavedChanges
                  }
                  onSelect={selectSubject}
                />
              ))
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* PANEL KANAN (LEBAR 40%): Detail Prasyarat Matkul Terpilih */}
        {/* ========================================================= */}
        <section
          aria-label="Detail Prasyarat Mata Kuliah"
          className="w-full lg:w-[40%] flex flex-col bg-white dark:bg-neutral-900 overflow-hidden"
        >
          {selectedSubject ? (
            <>
              {/* Header Panel Detail */}
              <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-sm bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border border-neutral-900 dark:border-neutral-100">
                        {selectedSubject.code}
                      </span>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {selectedSubject.credits} SKS
                        {selectedSubject.semester ? ` • Semester ${selectedSubject.semester}` : ""}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-sm bg-neutral-200/80 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        {selectedSubject.department}
                      </span>
                    </div>

                    <h2 className="mt-2 text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                      {selectedSubject.name}
                    </h2>

                    {selectedSubject.description && (
                      <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {selectedSubject.description}
                      </p>
                    )}
                  </div>

                  {hasUnsavedChanges && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-sm bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 animate-pulse">
                      Belum Disimpan
                    </span>
                  )}
                </div>
              </div>

              {/* Body: Daftar Prasyarat & Tombol Tambah Prasyarat */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      Daftar Prasyarat ({draftPrerequisites.length})
                    </h3>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                      Mata kuliah yang harus telah lulus sebelum mengambil matkul ini.
                    </p>
                  </div>

                  <span className="text-xs font-mono font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 px-2 py-0.5 rounded-sm">
                    {draftPrerequisites.reduce((acc, p) => acc + p.credits, 0)} Total SKS Prasyarat
                  </span>
                </div>

                {/* List Prasyarat */}
                {draftPrerequisites.length === 0 ? (
                  <div className="p-6 text-center rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20 text-neutral-500 dark:text-neutral-400 space-y-1">
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Belum ada mata kuliah prasyarat
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                      Mata kuliah ini dapat langsung diambil oleh mahasiswa tanpa syarat kelulusan matkul lain.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {draftPrerequisites.map((prereq) => (
                      <PrerequisiteItem
                        key={prereq.id}
                        subject={prereq}
                        onRemove={removePrerequisite}
                      />
                    ))}
                  </div>
                )}

                {/* Tombol 'Tambah Prasyarat' Bergaris Putus-putus (Dashed-Border) */}
                <button
                  type="button"
                  onClick={() => setIsAddDialogOpen(true)}
                  className="w-full border-2 border-dashed border-neutral-300 hover:border-blue-500 hover:bg-blue-50/50 text-neutral-700 hover:text-blue-700 dark:border-neutral-700 dark:hover:border-blue-500 dark:hover:bg-blue-950/20 dark:text-neutral-300 dark:hover:text-blue-300 py-3.5 px-4 rounded-md transition-all font-medium text-xs flex items-center justify-center gap-2 group cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  <span>Tambah Prasyarat</span>
                </button>

                {/* Info Box Akademik */}
                <div className="flex items-start gap-2.5 p-3 rounded-md border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300 text-xs">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Catatan Akademik:</strong> Relasi prasyarat disimpan langsung ke database dan akan divalidasi pada pengisian Kartu Rencana Studi (KRS).
                  </p>
                </div>
              </div>

              {/* Footer Panel: Tombol 'Simpan Perubahan' Berwarna Hitam Solid */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 shrink-0 flex items-center justify-between gap-3">
                <div>
                  {hasUnsavedChanges ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Perubahan belum tersimpan</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Semua perubahan tersimpan di database</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {hasUnsavedChanges && (
                    <button
                      type="button"
                      onClick={resetChanges}
                      disabled={isSaving}
                      className="px-3 py-2 text-xs font-medium rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Batal
                    </button>
                  )}

                  {/* Tombol 'Simpan Perubahan' Berwarna Hitam Solid */}
                  <button
                    type="button"
                    onClick={saveChanges}
                    disabled={!hasUnsavedChanges || isSaving}
                    className={`px-5 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 shadow-sm ${
                      hasUnsavedChanges && !isSaving
                        ? "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
                        : "bg-neutral-300 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500 cursor-not-allowed"
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan ke DB...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-neutral-400">
              <Sparkles className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mb-3" />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Pilih mata kuliah di panel kiri
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                Klik salah satu mata kuliah pada panel kiri untuk melihat dan mengelola daftar prasyaratnya.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Dialog Tambah Prasyarat */}
      <AddPrerequisiteDialog
        isOpen={isAddDialogOpen}
        targetSubject={selectedSubject}
        candidates={availableCandidates}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={addPrerequisite}
      />
    </div>
  );
}
