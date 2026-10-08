import { useDeferredValue, useState } from "react";
import type { Teacher } from "../types";
import type { TeacherFormValues } from "../schemas/teacherSchema";

export function useTeachersPageState() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusId, setStatusId] = useState("");
  const [specializationId, setSpecializationId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  return {
    search, setSearch, deferredSearch,
    statusId, setStatusId, specializationId, setSpecializationId,
    page, setPage, limit, setLimit,
    isAdding, setIsAdding, editingTeacher, setEditingTeacher,
    deletingTeacher, setDeletingTeacher, notice, setNotice,
  };
}

export type TeachersPageState = ReturnType<typeof useTeachersPageState>;

export function toCreateInput(values: TeacherFormValues) {
  return {
    profile_id: values.profile_id,
    teacher_number: values.teacher_number.trim(),
    ...(values.specialization_id ? { specialization_id: values.specialization_id } : {}),
    ...(values.employment_status_id ? { employment_status_id: values.employment_status_id } : {}),
    ...(values.join_date ? { join_date: values.join_date } : {}),
  };
}

export function toUpdateInput(values: TeacherFormValues) {
  return {
    teacher_number: values.teacher_number.trim(),
    specialization_id: values.specialization_id || null,
    employment_status_id: values.employment_status_id || null,
    join_date: values.join_date || null,
  };
}
