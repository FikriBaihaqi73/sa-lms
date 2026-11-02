import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import { useStudentProfilesForInstitution } from "./useStudentProfilesForInstitution";

vi.mock("@/lib/api", () => ({ apiFetch: vi.fn() }));

describe("student profile options", () => {
  it("requests scoped search and loads the next page", async () => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockResolvedValueOnce({ data: { data: [{ id: "1", fullName: "Alice", email: null }], meta: { page: 1, limit: 50, total: 2, totalPages: 2 } } });
    vi.mocked(apiFetch).mockResolvedValueOnce({ data: { data: [{ id: "2", fullName: "Alina", email: null }], meta: { page: 2, limit: 50, total: 2, totalPages: 2 } } });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result, unmount } = renderHook(() => {
      const query = useStudentProfilesForInstitution("Ali");
      return { query, pages: query.data?.pages };
    }, { wrapper });
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(apiFetch).toHaveBeenNthCalledWith(1, "/profiles/student-options?page=1&limit=50&search=Ali");
    await act(async () => { await result.current.query.fetchNextPage(); });
    expect(apiFetch).toHaveBeenNthCalledWith(2, "/profiles/student-options?page=2&limit=50&search=Ali");
    await waitFor(() => expect(result.current.pages?.flatMap((page) => page.data.map((item) => item.id))).toEqual(["1", "2"]));
    expect(apiFetch).toHaveBeenCalledTimes(2);
    unmount();
    client.clear();
  });
});
