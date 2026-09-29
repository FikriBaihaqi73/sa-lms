import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRole } from "../api";
import { rolesQueryKey } from "./useRoles";

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rolesQueryKey }),
  });
}
