export interface AssignmentTypeItem {
	id: string;
	name: string;
	description?: string | null;
}

export interface LearningModuleOption {
	id: string;
	title: string;
	class_subject_id: string;
	class_subject?: {
		id: string;
		class_id?: string;
		class?: { id: string; name: string };
		subject?: { id: string; name: string; code?: string };
		teacher?: {
			id: string;
			profile?: { fullName?: string };
			teacher_number?: string;
		};
	};
}

export interface AssignmentItem {
	id: string;
	created_at: string;
	updated_at: string;
	deleted_at?: string | null;
	module_id: string;
	assignment_type_id: string;
	title: string;
	description?: string | null;
	due_date?: string | null;
	max_score?: number | null;
	assignment_type?: AssignmentTypeItem | null;
	module?: {
		id: string;
		title: string;
		class_subject?: {
			id: string;
			class_id?: string;
			class?: { id: string; name: string };
			subject?: { id: string; name: string; code?: string };
			teacher?: {
				id: string;
				profile?: { fullName?: string };
				teacher_number?: string;
			};
		};
	} | null;
}

export interface AssignmentSubmissionItem {
	id: string;
	createdAt: string;
	updatedAt: string;
	assignmentId: string;
	studentId: string;
	submittedAt?: string | null;
	score?: number | null;
	feedback?: string | null;
	status?: "submitted" | "late" | "pending" | "graded" | string | null;
	fileName?: string | null;
	fileUrl?: string | null;
	gradedBy?: string | null;
	gradedAt?: string | null;
	student?: {
		id: string;
		studentNumber?: string;
		profile?: {
			fullName?: string;
			email?: string;
		};
	} | null;
	grader?: {
		id: string;
		name?: string;
		email?: string;
	} | null;
}

export interface StudentSubmissionRow {
	studentId: string;
	fullName: string;
	studentNumber: string;
	email: string;
	className: string;
	submissionId?: string;
	statusPengumpulan: "sudah_kumpul" | "terlambat" | "belum_kumpul";
	waktuKirim?: string | null;
	namaBerkas?: string | null;
	urlBerkas?: string | null;
	statusPenilaian: "sudah_dinilai" | "menunggu_dinilai" | "menunggu_submisi";
	nilaiAkhir?: number | null;
	skorMaksimal: number;
	catatanFeedback?: string | null;
	namaPenilai?: string | null;
}

export interface AssignmentStatsSummary {
	totalAssignments: number;
	totalModulesCount: number;
	submittedCount: number;
	totalStudentsCount: number;
	submissionPercentage: number;
	gradedCount: number;
	pendingGradingCount: number;
	unsubmittedCount: number;
}

export interface AcademicYearOption {
	id: string;
	academic_year: string;
	is_active: boolean;
	label: string;
}

export interface ClassOption {
	id: string;
	name: string;
	departmentName?: string;
}

export interface CreateAssignmentPayload {
	module_id: string;
	assignment_type_id: string;
	title: string;
	description?: string | null;
	due_date?: string | null;
	max_score?: number | null;
}

export interface UpdateAssignmentPayload {
	module_id?: string;
	assignment_type_id?: string;
	title?: string;
	description?: string | null;
	due_date?: string | null;
	max_score?: number | null;
}

export interface AssignmentFilters {
	page?: number;
	limit?: number;
	search?: string;
	academic_year_id?: string;
	class_id?: string;
	module_id?: string;
}
