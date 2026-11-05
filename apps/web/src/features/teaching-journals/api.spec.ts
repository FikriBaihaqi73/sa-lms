import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import { getJournal, getJournals } from "./api";

vi.mock("@/lib/api", () => ({ apiFetch: vi.fn() }));
describe("teaching journal API", () => {
	beforeEach(() => vi.resetAllMocks());
	it("passes supported filters and pagination", async () => {
		vi.mocked(apiFetch).mockResolvedValue({
			data: [],
			meta: { totalPages: 0, currentPage: 2, perPage: 10, totalData: 0 },
		});
		await getJournals({
			page: 2,
			limit: 10,
			search: "ipa & matematika",
			schedule_id: "id",
			journal_date: "2026-01-02",
		});
		const url = vi.mocked(apiFetch).mock.calls[0][0];
		const [path, query] = url.split("?");
		expect(path).toBe("/teaching-journals");
		expect(Object.fromEntries(new URLSearchParams(query))).toEqual({
			page: "2",
			limit: "10",
			search: "ipa & matematika",
			schedule_id: "id",
			journal_date: "2026-01-02",
		});
	});
	it("fetches detail and rejects invalid list responses", async () => {
		vi.mocked(apiFetch)
			.mockResolvedValueOnce({ data: { id: "j" } })
			.mockResolvedValueOnce({ data: null });
		expect(await getJournal("j")).toEqual({ id: "j" });
		expect(apiFetch).toHaveBeenCalledWith("/teaching-journals/j");
		await expect(getJournals({ page: 1, limit: 10 })).rejects.toThrow(
			"Respons daftar jurnal tidak valid.",
		);
	});
});
