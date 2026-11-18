export interface StandardGrade {
	id: string;
	grade: string;
	minimumScore: number | null;
	maximumScore: number | null;
	description: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface ExaminationScoreItem {
	id: string;
	examinationId: string;
	studentId: string;
	score: number | null;
	notes: string | null;
	gradedBy: string | null;
	gradedAt: string | null;
	createdAt?: string;
	updatedAt?: string;
	grader?: {
		id: string;
		email?: string;
		profile?: {
			id: string;
			fullName: string;
		} | null;
	} | null;
	student?: {
		id: string;
		studentNumber: string;
		profile?: {
			id: string;
			fullName: string;
		} | null;
	} | null;
	examination?: {
		id: string;
		title: string;
		maximumScore?: number | null;
	} | null;
}

export interface StudentParticipant {
	studentId: string;
	studentNumber: string;
	fullName: string;
	className?: string;
	scoreRecord?: ExaminationScoreItem | null;
}

export interface GradeMatchResult {
	grade: string;
	description: string | null;
	scoreRangeText: string;
	isMatched: boolean;
	colorBadge: {
		bg: string;
		text: string;
		border: string;
	};
}

export interface ExaminationOption {
	id: string;
	title: string;
	description?: string | null;
	examinationDate?: string | null;
	duration?: number | null;
	maximumScore?: number | null;
	classSubjectId?: string | null;
	classSubject?: {
		id: string;
		class?: {
			id: string;
			name: string;
			institution_id?: string;
		} | null;
		subject?: {
			id: string;
			name: string;
		} | null;
		academic_year?: {
			id: string;
			academic_year: string;
		} | null;
	} | null;
	assignmentType?: {
		id: string;
		name: string;
	} | null;
}

export interface AcademicYearOption {
	id: string;
	name: string;
	academic_year?: string;
	is_active?: boolean;
	label: string;
}

export interface ClassOption {
	id: string;
	name: string;
	grade_level?: number;
	academic_year_id?: string;
}

export interface CreateScoreInput {
	examinationId: string;
	studentId: string;
	score?: number;
	notes?: string;
	gradedBy?: string;
	gradedAt?: string;
}

export interface UpdateScoreInput {
	score?: number;
	notes?: string;
	gradedBy?: string;
	gradedAt?: string;
	examinationId?: string;
	studentId?: string;
}
