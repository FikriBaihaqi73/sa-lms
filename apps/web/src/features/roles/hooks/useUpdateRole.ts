import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRole } from "../api";
import { rolesQueryKey } from "./useRoles";
import type { RoleFormValues } from "../types";

interface UpdateRoleInput {
  id: string;
  values: RoleFormValues;
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: UpdateRoleInput) => updateRole(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rolesQueryKey }),
  });
}
