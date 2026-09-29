import { useQuery } from "@tanstack/react-query";
import { getRoles } from "../api";
import { usePermissions } from "./usePermissions";

export const rolesQueryKey = ["roles"] as const;

export function useRoles() {
  const permissionsQuery = usePermissions();
  const totalPermissions = permissionsQuery.data?.length ?? 0;

  return useQuery({
    queryKey: [...rolesQueryKey, totalPermissions],
    queryFn: () => getRoles(totalPermissions),
    enabled: !permissionsQuery.isPending,
  });
}
