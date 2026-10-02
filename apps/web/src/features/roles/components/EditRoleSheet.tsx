import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { roleFormSchema } from "../schemas";
import type { Permission, Role, RoleFormValues } from "../types";

interface RoleEditorSheetProps {
  open: boolean;
  role?: Role;
  permissions: Permission[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: RoleFormValues) => void;
}

export function RoleEditorSheet({ open, role, permissions, isSaving, onClose, onSave }: RoleEditorSheetProps) {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: role?.name ?? "", description: role?.description ?? "", permissionIds: role?.permissionIds ?? [] },
  });
  const groupedPermissions = permissions.reduce<Record<string, Permission[]>>(
    (groups, permission) => {
      (groups[permission.module] ??= []).push(permission);
      return groups;
    },
    {},
  );
  const selectedIds = useWatch({ control: form.control, name: "permissionIds" }) ?? [];
  if (!open) return null;
  const isAdding = !role;
  const togglePermission = (id: string, checked: boolean) => form.setValue("permissionIds", checked ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id), { shouldValidate: true });
  const toggleModule = (modulePermissions: Permission[], checked: boolean) => {
    const moduleIds = new Set(modulePermissions.map((permission) => permission.id));
    const remaining = selectedIds.filter((id) => !moduleIds.has(id));
    form.setValue("permissionIds", checked ? [...new Set([...remaining, ...moduleIds])] : remaining, { shouldValidate: true });
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/40" role="presentation" onMouseDown={onClose}>
      <aside className={`ml-auto flex h-full w-full flex-col bg-white shadow-2xl dark:bg-slate-800 ${isAdding ? "max-w-[400px]" : "max-w-xl"}`} role="dialog" aria-modal="true" aria-labelledby="role-sheet-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-zinc-200 p-6 dark:border-slate-700"><div><h2 id="role-sheet-title" className="text-xl font-semibold">{role ? "Edit Role" : "Tambah role"}</h2><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{isAdding ? "Tambahkan informasi role baru." : "Assign only permissions that already exist."}</p></div><Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}><X className="h-4 w-4" /></Button></div>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSave)}>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
            <div className="space-y-2"><Label htmlFor="role-name">Role name</Label><Input id="role-name" {...form.register("name")} placeholder="e.g. Academic coordinator" />{form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="role-description">Description</Label><textarea id="role-description" {...form.register("description")} className="flex min-h-24 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-700 dark:focus-visible:ring-zinc-300" placeholder="Describe this role" /></div>
            {!isAdding && <div><div className="mb-3"><Label>Permissions</Label><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Select the access this role should receive.</p></div>{permissions.length === 0 ? <p className="rounded-md bg-zinc-100 p-3 text-sm text-zinc-600 dark:bg-slate-700 dark:text-zinc-300">Permissions must be added elsewhere first.</p> : <div className="space-y-2">{Object.entries(groupedPermissions).map(([module, items]) => { const allSelected = items.every((permission) => selectedIds.includes(permission.id)); return <details key={module} className="rounded-lg border border-zinc-200 dark:border-slate-700" open><summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-medium"><span>{module}</span><label className="flex items-center gap-2 text-sm font-normal text-zinc-500" onClick={(event) => event.preventDefault()}><input type="checkbox" checked={allSelected} onChange={(event) => toggleModule(items, event.target.checked)} /> Select all</label></summary><div className="space-y-2 border-t border-zinc-200 p-4 dark:border-slate-700">{items.map((permission) => <label key={permission.id} className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={selectedIds.includes(permission.id)} onChange={(event) => togglePermission(permission.id, event.target.checked)} /><span>{permission.name}</span></label>)}</div></details>; })}</div>}{form.formState.errors.permissionIds && <p className="mt-2 text-sm text-destructive">{form.formState.errors.permissionIds.message}</p>}<p className="mt-3 text-xs text-amber-700 dark:text-amber-300">Permission assignments are ready in the form, but the current backend does not save them yet.</p></div>}
          </div>
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-zinc-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"><Button type="button" variant="outline" onClick={onClose}>Batal</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Menyimpan..." : isAdding ? "Simpan role" : "Save Changes"}</Button></div>
        </form>
      </aside>
    </div>
  );
}

interface EditRoleSheetProps extends Omit<RoleEditorSheetProps, "role"> { role: Role | null; }

export function EditRoleSheet({ role, ...props }: EditRoleSheetProps) {
  return <RoleEditorSheet {...props} role={role ?? undefined} />;
}
