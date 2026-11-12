import { Check, KeyRound, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { TeacherCreatedCredentials } from "../types";

interface TeacherCredentialModalProps {
	open: boolean;
	credentials: TeacherCreatedCredentials | null;
	onClose: () => void;
}

export function TeacherCredentialModal({
	open,
	credentials,
	onClose,
}: TeacherCredentialModalProps) {
	const [copied, setCopied] = useState(false);

	if (!open || !credentials) return null;

	const waText = `Halo ${credentials.fullName},
Berikut adalah kredensial login akun Guru Anda di Sistem Academic:
• Email: ${credentials.email}
• Password: ${credentials.password}
• NIP: ${credentials.teacherNumber}

Silakan gunakan informasi di atas untuk masuk ke sistem dan segera lakukan pergantian kata sandi Anda demi keamanan.`;

	const handleCopyWa = async () => {
		try {
			await navigator.clipboard.writeText(waText);
			setCopied(true);
			toast.success("Info login berhasil disalin ke clipboard!");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Gagal menyalin teks.");
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
			role="dialog"
			aria-modal="true"
		>
			<div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<span className="flex size-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-400">
							<KeyRound className="size-5" />
						</span>
						<div>
							<h3 className="text-lg font-bold text-slate-900 dark:text-white">
								Akun Guru Berhasil Dibuat!
							</h3>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								Simpan atau bagikan informasi login ini kepada guru terkait.
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
						aria-label="Tutup"
					>
						<X className="size-5" />
					</button>
				</div>

				{/* Kotak Rincian Kredensial */}
				<div className="mt-5 space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950">
					<div className="flex justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800/80">
						<span className="font-medium text-slate-500 dark:text-slate-400">
							Nama Guru
						</span>
						<span className="font-semibold text-slate-900 dark:text-white">
							{credentials.fullName}
						</span>
					</div>
					<div className="flex justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800/80">
						<span className="font-medium text-slate-500 dark:text-slate-400">
							NIP
						</span>
						<span className="font-mono font-semibold text-slate-900 dark:text-white">
							{credentials.teacherNumber}
						</span>
					</div>
					<div className="flex justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800/80">
						<span className="font-medium text-slate-500 dark:text-slate-400">
							Email Login
						</span>
						<span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
							{credentials.email}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="font-medium text-slate-500 dark:text-slate-400">
							Password Awal
						</span>
						<span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
							{credentials.password}
						</span>
					</div>
				</div>

				{/* Tombol Aksi */}
				<div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="border-slate-200 dark:border-slate-800"
					>
						Selesai
					</Button>
					<Button
						type="button"
						onClick={handleCopyWa}
						className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
					>
						{copied ? (
							<>
								<Check className="mr-2 size-4" /> Tersalin!
							</>
						) : (
							<>
								<MessageSquare className="mr-2 size-4" /> Salin Info Login (WA)
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
