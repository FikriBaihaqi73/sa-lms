import { useQuery } from "@tanstack/react-query";
import { getPermissions } from "../api";

export const permissionsQueryKey = ["permissions"] as const;

export function usePermissions() {
  return useQuery({ queryKey: permissionsQueryKey, queryFn: getPermissions });
}
