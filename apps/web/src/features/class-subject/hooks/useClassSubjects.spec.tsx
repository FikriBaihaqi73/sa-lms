// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { deleteClassSubjectApi } from "../api/classSubjects";
import { CLASS_SUBJECTS_QUERY_KEY, useDeleteClassSubject } from "./useClassSubjects";

vi.mock("../api/classSubjects", async () => {
  const actual = await vi.importActual<typeof import("../api/classSubjects")>("../api/classSubjects");
  return { ...actual, deleteClassSubjectApi: vi.fn() };
});

describe("useDeleteClassSubject", () => {
  it("invalidates all class-subject list caches after delete", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    vi.mocked(deleteClassSubjectApi).mockResolvedValue({ id: "class-subject-1" });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useDeleteClassSubject(), { wrapper });
    await result.current.mutateAsync("class-subject-1");

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: CLASS_SUBJECTS_QUERY_KEY });
    });
  });
});
