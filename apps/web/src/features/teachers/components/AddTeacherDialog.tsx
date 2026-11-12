import { TeacherDialogForm } from "./TeacherDialogForm";
import type { TeacherFormProfile, TeacherReference } from "../types";
import type { TeacherFormValues } from "../schemas/teacherSchema";

interface AddTeacherDialogProps {
  open: boolean;
  statuses: TeacherReference[];
  specializations: TeacherReference[];
  departments?: TeacherReference[];
  profiles: TeacherFormProfile[];
  isSaving: boolean;
  serverError?: string | null;
  onClose: () => void;
  onSave: (values: TeacherFormValues) => Promise<void>;
}

export function AddTeacherDialog(props: AddTeacherDialogProps) {
  return (
    <TeacherDialogForm
      {...props}
      title="Tambah guru"
      subtitle="Data master guru saja, tanpa membuat akun login."
      submitLabel="Tambah guru"
    />
  );
}
