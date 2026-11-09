import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import type {
	CreateTeacherFormValues,
	UpdateTeacherFormValues,
} from "../schemas/teacherSchema";
import type { Teacher, TeacherCreatedCredentials } from "../types";

export function useTeachersPageState() {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 400);
	const [statusId, setStatusId] = useState("");
	const [specializationId, setSpecializationId] = useState("");
	const [departmentId, setDepartmentId] = useState("");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [isAdding, setIsAdding] = useState(false);
	const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
	const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
	const [createdCredentials, setCreatedCredentials] =
		useState<TeacherCreatedCredentials | null>(null);
	const [notice, setNotice] = useState<{
		kind: "success" | "error";
		message: string;
	} | null>(null);

	return {
		search,
		setSearch,
		debouncedSearch,
		statusId,
		setStatusId,
		specializationId,
		setSpecializationId,
		departmentId,
		setDepartmentId,
		page,
		setPage,
		limit,
		setLimit,
		isAdding,
		setIsAdding,
		editingTeacher,
		setEditingTeacher,
		deletingTeacher,
		setDeletingTeacher,
		createdCredentials,
		setCreatedCredentials,
		notice,
		setNotice,
	};
}

export type TeachersPageState = ReturnType<typeof useTeachersPageState>;

export function toCreateInput(values: CreateTeacherFormValues) {
	return {
		full_name: values.full_name.trim(),
		email: values.email.trim().toLowerCase(),
		password: values.password,
		gender: values.gender || null,
		phone: values.phone?.trim() || null,
		teacher_number: values.teacher_number.trim(),
		join_date: values.join_date || null,
		department_id: values.department_id || null,
		specialization_id: values.specialization_id || null,
		employment_status_id: values.employment_status_id || null,
	};
}

export function toUpdateInput(values: UpdateTeacherFormValues) {
	return {
		full_name: values.full_name.trim(),
		email: values.email.trim().toLowerCase(),
		password: values.password?.trim() ? values.password.trim() : null,
		gender: values.gender || null,
		phone: values.phone?.trim() || null,
		teacher_number: values.teacher_number.trim(),
		join_date: values.join_date || null,
		department_id: values.department_id || null,
		specialization_id: values.specialization_id || null,
		employment_status_id: values.employment_status_id || null,
	};
}
