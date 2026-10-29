export interface DepartmentOption {
  id: string;
  name: string;
  code?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester?: number;
  departmentId?: string;
  department: string;
  description?: string;
  prerequisiteIds: string[];
}

export interface SubjectWithPrerequisites extends Subject {
  prerequisites: Subject[];
}

export type FilterPrerequisiteOption = "all" | "has_prerequisites" | "no_prerequisites";

export interface SubjectPrerequisiteRelation {
  id: string;
  subjectId: string;
  prerequisiteSubjectId: string;
  subject?: {
    id: string;
    code: string;
    name: string;
    credits: number;
    description?: string | null;
    department?: { id: string; name: string } | null;
  };
  prerequisiteSubject?: {
    id: string;
    code: string;
    name: string;
    credits: number;
    description?: string | null;
    department?: { id: string; name: string } | null;
  };
}

export interface SubjectApiItem {
  id: string;
  code: string;
  name: string;
  credits: number;
  description?: string | null;
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
}
