import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getDepartmentsApi } from "@/features/departments/api/departments";
import {
  createSubjectPrerequisiteApi,
  deleteSubjectPrerequisiteApi,
  fetchSubjectPrerequisitesApi,
  fetchSubjectsApi,
} from "../api/subjectPrerequisites";
import type {
  DepartmentOption,
  FilterPrerequisiteOption,
  Subject,
} from "../types";

export function useSubjectPrerequisitesAuto() {
  const queryClient = useQueryClient();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPrerequisite, setFilterPrerequisite] =
    useState<FilterPrerequisiteOption>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [draftMap, setDraftMap] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch real subjects from backend
  const subjectsQuery = useQuery({
    queryKey: ["subjects", "all"],
    queryFn: () => fetchSubjectsApi(1, 200),
    staleTime: 30_000,
  });

  // 2. Fetch real prerequisites from backend
  const prerequisitesQuery = useQuery({
    queryKey: ["subject-prerequisites", "all"],
    queryFn: () => fetchSubjectPrerequisitesApi(1, 200),
    staleTime: 30_000,
  });

  // 3. Fetch real departments / jurusan from backend
  const departmentsQuery = useQuery({
    queryKey: ["departments", "all"],
    queryFn: () => getDepartmentsApi({ page: 1, limit: 100 }),
    staleTime: 60_000,
  });

  // Map of departmentId -> Department name
  const departmentNameMap = useMemo(() => {
    const map = new Map<string, string>();
    const depts = departmentsQuery.data?.data ?? [];
    for (const d of depts) {
      map.set(d.id, d.name);
    }
    return map;
  }, [departmentsQuery.data]);

  // Unified list of all available departments (Jurusan / Program Studi)
  const departments: DepartmentOption[] = useMemo(() => {
    const list: DepartmentOption[] = [];
    const seenIds = new Set<string>();

    // 1. Prioritize real registered departments from the database
    const apiDepts = departmentsQuery.data?.data ?? [];
    for (const d of apiDepts) {
      if (!seenIds.has(d.id)) {
        seenIds.add(d.id);
        list.push({
          id: d.id,
          name: d.name,
          code: d.code,
        });
      }
    }

    // 2. Also check if subjects have any attached department objects not yet in list
    const apiSubjects = subjectsQuery.data?.data ?? [];
    for (const s of apiSubjects) {
      if (s.department && !seenIds.has(s.department.id)) {
        seenIds.add(s.department.id);
        list.push({
          id: s.department.id,
          name: s.department.name,
        });
      }
    }

    return list;
  }, [departmentsQuery.data, subjectsQuery.data]);

  // Map of `${subjectId}:${prerequisiteSubjectId}` -> relation.id in database
  const relationIdMap = useMemo(() => {
    const map = new Map<string, string>();
    const relations = prerequisitesQuery.data?.data ?? [];
    for (const rel of relations) {
      if (rel.id && rel.subjectId && rel.prerequisiteSubjectId) {
        map.set(`${rel.subjectId}:${rel.prerequisiteSubjectId}`, rel.id);
      }
    }
    return map;
  }, [prerequisitesQuery.data]);

  // Transform backend subjects and attach their real prerequisite IDs and department
  const subjects: Subject[] = useMemo(() => {
    const apiSubjects = subjectsQuery.data?.data ?? [];
    const relations = prerequisitesQuery.data?.data ?? [];

    return apiSubjects.map((s) => {
      const prereqIds = relations
        .filter((r) => r.subjectId === s.id)
        .map((r) => r.prerequisiteSubjectId);

      const deptId = s.departmentId || s.department?.id || undefined;
      const deptName =
        s.department?.name ||
        (deptId ? departmentNameMap.get(deptId) : undefined) ||
        "Umum";

      return {
        id: s.id,
        code: s.code,
        name: s.name,
        credits: s.credits,
        departmentId: deptId,
        department: deptName,
        description: s.description || undefined,
        prerequisiteIds: prereqIds,
      };
    });
  }, [subjectsQuery.data, prerequisitesQuery.data, departmentNameMap]);

  // Set active subject ID (default to first subject if not selected)
  const activeSubjectId = useMemo(() => {
    if (selectedSubjectId && subjects.some((s) => s.id === selectedSubjectId)) {
      return selectedSubjectId;
    }
    return subjects[0]?.id ?? "";
  }, [selectedSubjectId, subjects]);

  const selectedSubject = useMemo(() => {
    return subjects.find((s) => s.id === activeSubjectId) ?? null;
  }, [subjects, activeSubjectId]);

  // Draft prerequisites for the active subject
  const currentDraftIds = useMemo(() => {
    if (!selectedSubject) return [];
    if (draftMap[selectedSubject.id] !== undefined) {
      return draftMap[selectedSubject.id];
    }
    return selectedSubject.prerequisiteIds;
  }, [selectedSubject, draftMap]);

  const hasUnsavedChanges = useMemo(() => {
    if (!selectedSubject) return false;
    const original = [...selectedSubject.prerequisiteIds].sort().join(",");
    const draft = [...currentDraftIds].sort().join(",");
    return original !== draft;
  }, [selectedSubject, currentDraftIds]);

  // Map to resolve subject objects
  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    for (const sub of subjects) {
      map.set(sub.id, sub);
    }
    return map;
  }, [subjects]);

  const draftPrerequisites = useMemo(() => {
    return currentDraftIds
      .map((id) => subjectMap.get(id))
      .filter((s): s is Subject => s !== undefined);
  }, [currentDraftIds, subjectMap]);

  // Eligible candidate subjects to be added
  const availableCandidates = useMemo(() => {
    if (!selectedSubject) return [];
    return subjects.filter((s) => {
      if (s.id === selectedSubject.id) return false;
      if (currentDraftIds.includes(s.id)) return false;
      return true;
    });
  }, [subjects, selectedSubject, currentDraftIds]);

  // Filtered subjects on left panel
  const filteredSubjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return subjects.filter((item) => {
      if (query) {
        const matchCode = item.code.toLowerCase().includes(query);
        const matchName = item.name.toLowerCase().includes(query);
        if (!matchCode && !matchName) return false;
      }

      // Department / Jurusan filter
      if (selectedDepartment !== "all") {
        const matchDeptId = item.departmentId === selectedDepartment;
        const matchDeptName = item.department === selectedDepartment;
        if (!matchDeptId && !matchDeptName) return false;
      }

      // Prerequisite filter
      if (filterPrerequisite === "has_prerequisites" && item.prerequisiteIds.length === 0) {
        return false;
      }
      if (filterPrerequisite === "no_prerequisites" && item.prerequisiteIds.length > 0) {
        return false;
      }

      return true;
    });
  }, [subjects, searchQuery, selectedDepartment, filterPrerequisite]);

  // Actions
  const handleSelectSubject = (id: string) => {
    setSelectedSubjectId(id);
  };

  const handleAddPrerequisite = (prerequisiteId: string) => {
    if (!selectedSubject) return;
    if (prerequisiteId === selectedSubject.id) {
      toast.error("Mata kuliah tidak bisa menjadi prasyarat untuk dirinya sendiri.");
      return;
    }
    if (currentDraftIds.includes(prerequisiteId)) {
      toast.error("Mata kuliah ini sudah ada dalam daftar prasyarat.");
      return;
    }

    const updated = [...currentDraftIds, prerequisiteId];
    setDraftMap((prev) => ({
      ...prev,
      [selectedSubject.id]: updated,
    }));
  };

  const handleRemovePrerequisite = (prerequisiteId: string) => {
    if (!selectedSubject) return;
    const updated = currentDraftIds.filter((id) => id !== prerequisiteId);
    setDraftMap((prev) => ({
      ...prev,
      [selectedSubject.id]: updated,
    }));
  };

  const handleResetChanges = () => {
    if (!selectedSubject) return;
    setDraftMap((prev) => {
      const next = { ...prev };
      delete next[selectedSubject.id];
      return next;
    });
    toast.info("Perubahan prasyarat dibatalkan.");
  };

  // Real Database Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSubject) return;

      const originalIds = selectedSubject.prerequisiteIds;
      const draftIds = currentDraftIds;

      const toAdd = draftIds.filter((id) => !originalIds.includes(id));
      const toRemove = originalIds.filter((id) => !draftIds.includes(id));

      // 1. Create new prerequisites in PostgreSQL
      const createPromises = toAdd.map((prereqId) =>
        createSubjectPrerequisiteApi(selectedSubject.id, prereqId),
      );

      // 2. Delete removed prerequisites in PostgreSQL
      const deletePromises = toRemove.map((prereqId) => {
        const relationKey = `${selectedSubject.id}:${prereqId}`;
        const relId = relationIdMap.get(relationKey);
        if (relId) {
          return deleteSubjectPrerequisiteApi(relId);
        }
        return Promise.resolve({ id: "" });
      });

      await Promise.all([...createPromises, ...deletePromises]);

      // 3. Invalidate query cache to reload fresh data from database
      await queryClient.invalidateQueries({
        queryKey: ["subject-prerequisites"],
      });
    },
    onMutate: () => {
      setIsSaving(true);
    },
    onSuccess: () => {
      if (selectedSubject) {
        setDraftMap((prev) => {
          const next = { ...prev };
          delete next[selectedSubject.id];
          return next;
        });
        toast.success(
          `Prasyarat mata kuliah ${selectedSubject.code} berhasil disimpan ke database.`,
        );
      }
    },
    onError: (err: Error) => {
      toast.error(`Gagal menyimpan prasyarat: ${err.message}`);
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const handleSaveChanges = () => {
    saveMutation.mutate();
  };

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["subjects"] }),
      queryClient.invalidateQueries({ queryKey: ["subject-prerequisites"] }),
      queryClient.invalidateQueries({ queryKey: ["departments"] }),
    ]);
    toast.success("Data berhasil disinkronkan dari database.");
  };

  return {
    subjects,
    selectedSubject,
    selectedSubjectId: activeSubjectId,
    draftPrerequisites,
    hasUnsavedChanges,
    availableCandidates,
    departments,
    filteredSubjects,
    searchQuery,
    filterPrerequisite,
    selectedDepartment,
    isLoading:
      subjectsQuery.isLoading ||
      prerequisitesQuery.isLoading ||
      departmentsQuery.isLoading,
    isError:
      subjectsQuery.isError ||
      prerequisitesQuery.isError ||
      departmentsQuery.isError,
    error: (subjectsQuery.error ||
      prerequisitesQuery.error ||
      departmentsQuery.error) as Error | null,
    isSaving,
    setSearchQuery,
    setFilterPrerequisite,
    setSelectedDepartment,
    selectSubject: handleSelectSubject,
    addPrerequisite: handleAddPrerequisite,
    removePrerequisite: handleRemovePrerequisite,
    saveChanges: handleSaveChanges,
    resetChanges: handleResetChanges,
    refreshData: handleRefresh,
  };
}
