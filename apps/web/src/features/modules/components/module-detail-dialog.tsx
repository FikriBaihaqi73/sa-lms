import {
	BookOpen,
	CheckCircle2,
	FileText,
	GraduationCap,
	Lock,
	Unlock,
	User,
} from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { ClassSubjectOption, LearningModule } from "../types";

interface ModuleDetailDialogProps {
	isOpen: boolean;
	module: LearningModule | null;
	classSubjectMap?: Record<string, ClassSubjectOption>;
	onClose: () => void;
	onEdit: (item: LearningModule) => void;
}

function formatDate(dateStr?: string | null): string {
	if (!dateStr) return "—";
	const date = new Date(dateStr);
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat("id-ID", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

export const ModuleDetailDialog: React.FC<ModuleDetailDialogProps> = ({
	isOpen,
	module,
	classSubjectMap = {},
	onClose,
	onEdit,
}) => {
	if (!module) return null;

	const classSubjectInfo = classSubjectMap[module.class_subject_id];
	const className =
		module.class_subject?.class?.name ||
		classSubjectInfo?.className ||
		"Kelas";
	const subjectName =
		module.class_subject?.subject?.name ||
		classSubjectInfo?.subjectName ||
		"Mata Pelajaran";
	const teacherName =
		module.class_subject?.teacher?.profile?.fullName ||
		module.class_subject?.teacher?.teacher_number ||
		classSubjectInfo?.teacherName ||
		"Guru Pengampu";

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
							#{module.display_order ?? 1}
						</span>
						<DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
							{module.title}
						</DialogTitle>
					</div>
					<DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
						Rincian informasi silabus, materi pembelajaran, dan status akses modul.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 pt-2 text-sm">
					{/* Status Badges */}
					<div className="flex flex-wrap items-center gap-2">
						{module.is_published ? (
							<Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800 gap-1">
								<CheckCircle2 className="size-3" /> Diterbitkan
							</Badge>
						) : (
							<Badge variant="outline" className="text-slate-500 border-slate-300 dark:border-slate-700">
								Draf (Belum Terbit)
							</Badge>
						)}

						{module.is_locked ? (
							<Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800 gap-1">
								<Lock className="size-3" /> Terkunci
							</Badge>
						) : (
							<Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800 gap-1">
								<Unlock className="size-3" /> Terbuka untuk Siswa
							</Badge>
						)}
					</div>

					{/* Informasi Mapel Kelas */}
					<div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2 dark:border-slate-800 dark:bg-slate-950/40">
						<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							<GraduationCap className="size-4 text-blue-600 dark:text-blue-400" />
							<span>Informasi Kelas & Pengampu</span>
						</div>
						<div className="grid grid-cols-2 gap-2 pt-1 text-xs">
							<div>
								<span className="text-slate-400">Mata Pelajaran:</span>
								<p className="font-semibold text-slate-800 dark:text-slate-200">
									{subjectName}
								</p>
							</div>
							<div>
								<span className="text-slate-400">Rombongan Belajar:</span>
								<p className="font-semibold text-slate-800 dark:text-slate-200">
									{className}
								</p>
							</div>
							<div className="col-span-2">
								<span className="text-slate-400">Guru / Pengajar:</span>
								<p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
									<User className="size-3.5 text-slate-400" />
									{teacherName}
								</p>
							</div>
						</div>
					</div>

					{/* Deskripsi */}
					<div className="space-y-1">
						<span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
							Deskripsi Silabus
						</span>
						<p className="rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
							{module.description || "Tidak ada deskripsi rincian silabus yang dilampirkan."}
						</p>
					</div>

					{/* Konten Terkait */}
					<div className="space-y-2">
						<span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
							Materi & Tugas Terhubung
						</span>
						<div className="grid grid-cols-2 gap-2 text-xs">
							<div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950">
								<FileText className="size-4 text-blue-500" />
								<div>
									<p className="font-semibold text-slate-800 dark:text-slate-200">
										{module.moduleContents?.length ?? 0} Bahan Ajar
									</p>
									<p className="text-[11px] text-slate-400">Teks, PDF, Video</p>
								</div>
							</div>
							<div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950">
								<BookOpen className="size-4 text-violet-500" />
								<div>
									<p className="font-semibold text-slate-800 dark:text-slate-200">
										{module.assignments?.length ?? 0} Tugas Belajar
									</p>
									<p className="text-[11px] text-slate-400">Penugasan siswa</p>
								</div>
							</div>
						</div>
					</div>

					{/* Metadata Waktu */}
					<div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] text-slate-400 dark:border-slate-800">
						<span>Dibuat: {formatDate(module.created_at)}</span>
						<span>Diperbarui: {formatDate(module.updated_at)}</span>
					</div>
				</div>

				<DialogFooter className="pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="border-slate-200 dark:border-slate-800"
					>
						Tutup
					</Button>
					<Button
						type="button"
						onClick={() => {
							onClose();
							onEdit(module);
						}}
						className="bg-blue-600 text-white hover:bg-blue-700"
					>
						Ubah Modul
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

