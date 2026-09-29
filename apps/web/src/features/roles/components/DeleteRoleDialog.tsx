import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Role } from "../types";

interface DeleteRoleDialogProps {
  role: Role | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteRoleDialog({ role, isDeleting, onClose, onConfirm }: DeleteRoleDialogProps) {
  if (!role) return null;
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/40 p-4" role="presentation"><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800" role="alertdialog" aria-modal="true" aria-labelledby="delete-role-title"><AlertTriangle className="h-8 w-8 text-destructive" /><h2 id="delete-role-title" className="mt-4 text-lg font-semibold">Delete role?</h2><p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Deleting <strong>{role.name}</strong> cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={onClose}>Cancel</Button><Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting} onClick={onConfirm}>{isDeleting ? "Deleting..." : "Delete role"}</Button></div></div></div>;
}
