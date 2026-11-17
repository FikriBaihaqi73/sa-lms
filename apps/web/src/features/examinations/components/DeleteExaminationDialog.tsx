import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Examination } from "../types";

export function DeleteExaminationDialog({ item, isDeleting, onClose, onConfirm }: { item: Examination | null; isDeleting: boolean; onClose: () => void; onConfirm: () => Promise<void> }) {
  return <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>Hapus ujian?</DialogTitle><DialogDescription>Ujian “{item?.title}” akan dihapus secara soft delete.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={onClose} disabled={isDeleting}>Batal</Button><Button variant="destructive" onClick={() => void onConfirm()} disabled={isDeleting}>{isDeleting ? "Menghapus..." : "Hapus"}</Button></DialogFooter></DialogContent></Dialog>;
}
