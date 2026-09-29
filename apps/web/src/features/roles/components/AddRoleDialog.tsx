import { RoleEditorSheet } from "./EditRoleSheet";
import type { Permission, RoleFormValues } from "../types";

interface AddRoleDialogProps {
  open: boolean;
  permissions: Permission[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: RoleFormValues) => void;
}

export function AddRoleDialog(props: AddRoleDialogProps) {
  return <RoleEditorSheet {...props} />;
}
