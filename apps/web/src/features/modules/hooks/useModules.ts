import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  createModule,
  createModuleContent,
  deleteModule,
  deleteModuleContent,
  getClassSubjectOptions,
  getModuleById,
  getModuleContents,
  getModules,
  updateModule,
  updateModuleContent,
} from "../api/modules";
import type {
  CreateModuleContentInput,
  CreateModuleInput,
  LearningModule,
  ModuleFilters,
  ModuleStats,
  UpdateModuleContentInput,
  UpdateModuleInput,
} from "../types";

export const MODULES_QUERY_KEY = ["modules"] as const;
export const MODULE_CONTENTS_QUERY_KEY = ["module-contents"] as const;
export const CLASS_SUBJECT_OPTIONS_KEY = ["class-subject-options"] as const;

export function useModules(filters: ModuleFilters = {}) {
  return useQuery({
    queryKey: [...MODULES_QUERY_KEY, filters],
    queryFn: () => getModules(filters),
  });
}

export function useModuleDetail(id: string | null) {
  return useQuery({
    queryKey: [...MODULES_QUERY_KEY, "detail", id],
    queryFn: () => (id ? getModuleById(id) : null),
    enabled: Boolean(id),
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateModuleInput) => createModule(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY });
    },
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModuleInput }) =>
      updateModule(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY });
    },
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteModule(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY });
    },
  });
}

export function useModuleContents(filters: {
  moduleId?: string;
  search?: string;
  contentType?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: [...MODULE_CONTENTS_QUERY_KEY, filters],
    queryFn: () => getModuleContents(filters),
  });
}

export function useCreateModuleContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateModuleContentInput) => createModuleContent(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MODULE_CONTENTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY }),
      ]);
    },
  });
}

export function useUpdateModuleContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateModuleContentInput;
    }) => updateModuleContent(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MODULE_CONTENTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY }),
      ]);
    },
  });
}

export function useDeleteModuleContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteModuleContent(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MODULE_CONTENTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY }),
      ]);
    },
  });
}

export function useClassSubjectOptions() {
  return useQuery({
    queryKey: CLASS_SUBJECT_OPTIONS_KEY,
    queryFn: getClassSubjectOptions,
    staleTime: 5 * 60 * 1000,
  });
}

export function useModuleStats(modules: LearningModule[]): ModuleStats {
  return useMemo(() => {
    let published = 0;
    let locked = 0;
    let totalContents = 0;

    for (const m of modules) {
      if (m.is_published) published++;
      if (m.is_locked) locked++;
      if (Array.isArray(m.moduleContents)) {
        totalContents += m.moduleContents.length;
      }
    }

    return {
      totalModules: modules.length,
      publishedModules: published,
      lockedModules: locked,
      totalContents,
    };
  }, [modules]);
}

