import { describe, expect, it, vi } from "vitest";

const apiFetch = vi.hoisted(() => vi.fn());
vi.mock("@/lib/api", () => ({ apiFetch }));

import { getSubjectsApi } from "./subjects";

describe("subjects api", () => {
  it("unwraps the nested subject response", async () => {
    apiFetch.mockResolvedValue({ data: { data: [{ id: "subject-1", name: "Matematika" }], total: 1 } });
    await expect(getSubjectsApi()).resolves.toEqual({ data: [{ id: "subject-1", name: "Matematika" }], total: 1 });
  });

  it("requests subjects with the maximum supported page size", async () => {
    apiFetch.mockResolvedValue({ data: [], total: 0 });
    await getSubjectsApi();
    expect(apiFetch).toHaveBeenCalledWith("/subjects?page=1&limit=100");
  });
});
