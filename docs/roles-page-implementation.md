# Roles Page

The Roles page is available through the current web application entry point. It provides role search, type filtering, KPI summaries, creation, editing, and guarded deletion.

## Available endpoints

The frontend uses the existing API base configured by `VITE_API_URL`.

| Method | URL | Usage |
| --- | --- | --- |
| GET | `/roles?limit=100` | Load roles |
| GET | `/permissions` | Load read-only permissions for the assignment UI |
| POST | `/roles` | Create a role |
| PATCH | `/roles/:id` | Update a role |
| DELETE | `/roles/:id` | Delete a role |

Requests use the central `src/lib/api.ts` wrapper. The current API returns the standard envelope:

```json
{
  "status": "success",
  "message": "Roles retrieved successfully",
  "data": []
}
```

## Request bodies

The deployed backend currently accepts only `name` and `description` for role creation and updates:

```json
{
  "name": "Academic coordinator",
  "description": "Coordinates academic schedules"
}
```

The form also collects `permissionIds`, for example:

```json
{
  "permissionIds": ["8fbde931-1b6d-4db2-873b-f8694c04a711"]
}
```

Those IDs are intentionally not sent yet because the current backend `CreateRoleDto` and `UpdateRoleDto` do not accept them. The explicit TODO is in `apps/web/src/features/roles/api.ts`. A role-permission bulk assignment endpoint (or `permissionIds` accepted by create/update) is required before assignments can persist.

## Frontend behavior

1. The page loads permissions and roles through TanStack Query.
2. KPI cards are derived from returned role and permission data.
3. Search is deferred to keep typing responsive; role type filtering runs client-side.
4. The editor groups permissions by module, supports select-all per module, and validates a role name of at least two characters plus one selected permission.
5. Successful create, update, and delete operations invalidate the roles cache and show `Perubahan berhasil disimpan`.
6. Failed operations show the API error message.

## Important backend gaps

The current role list does not return `userCount`, `isSystemRole`, `roleSlug`, or aggregate permission fields. The UI therefore derives a slug and permission count from `rolePermissions`; unknown system/user values fall back to `false` and `0`.

For accurate role guards, extend the response with `isSystemRole` and `userCount`, and enforce the same deletion constraints server-side. Until then, the frontend can only enforce guards when those fields are present in the API contract.

## Validation and edge cases

- A blank/one-character role name is rejected inline.
- At least one permission must be selected.
- Empty permissions show an inline instruction that permissions must be added elsewhere.
- Empty filtered results show an add-role call to action.
- Loading roles show skeleton rows.
- The delete control is disabled with an explanatory tooltip for known system roles or roles with active users.
