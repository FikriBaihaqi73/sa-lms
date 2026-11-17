import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ invalidateQueries: vi.fn(), useMutation: vi.fn((options: { onSuccess: () => void }) => options) }));
vi.mock("@tanstack/react-query", () => ({ useMutation: mocks.useMutation, useQuery: vi.fn(), useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }) }));
vi.mock("../api/examinations", () => ({ createExaminationApi: vi.fn(), deleteExaminationApi: vi.fn(), getExaminationStatsApi: vi.fn(), getExaminationsApi: vi.fn(), updateExaminationApi: vi.fn() }));

describe("examination mutations", () => {
  it("invalidate list and stats after create, update, and delete", async () => {
    const hooks = await import("./useExaminations");
    hooks.useCreateExamination(); hooks.useUpdateExamination(); hooks.useDeleteExamination();
    for (const call of mocks.useMutation.mock.calls) call[0].onSuccess();
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["examinations"] });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["examinations", "stats"] });
    expect(mocks.invalidateQueries).toHaveBeenCalledTimes(6);
  });
});
