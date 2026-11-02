import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import { useCreateStudent, useUpdateStudent } from "./useStudents";

vi.mock("@/lib/api", () => ({ apiFetch: vi.fn() }));

describe("student mutations", () => {
  it("sends create and update requests and invalidates students", async () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidate = vi.spyOn(client, "invalidateQueries");
    vi.mocked(apiFetch).mockResolvedValue({ data: { id: "s1" } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result, unmount } = renderHook(() => ({ create: useCreateStudent(), update: useUpdateStudent() }), { wrapper });
    const create = { profileId: "profile-1", academicStatusId: "status-1", studentNumber: "123", departmentId: "department-1", enrollmentYear: 2026 };
    await act(async () => { await result.current.create.mutateAsync(create); });
    expect(apiFetch).toHaveBeenCalledWith("/students", { method: "POST", body: JSON.stringify(create) });
    const update = { academicStatusId: "status-1", studentNumber: "456", departmentId: "department-1" };
    await act(async () => { await result.current.update.mutateAsync({ id: "s1", input: update }); });
    expect(apiFetch).toHaveBeenCalledWith("/students/s1", { method: "PATCH", body: JSON.stringify(update) });
    expect(invalidate).toHaveBeenCalledTimes(3);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["students"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["student-profile-options"] });
    unmount();
    client.clear();
  });
});
