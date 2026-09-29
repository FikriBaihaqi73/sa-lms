import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRole } from "../api";
import { rolesQueryKey } from "./useRoles";

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rolesQueryKey }),
  });
}
