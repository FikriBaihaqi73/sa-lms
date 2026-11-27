import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import { retryStudyPlanQuery } from "./index";

describe("retryStudyPlanQuery", () => {
	it("does not retry a bad request", () => {
		expect(
			retryStudyPlanQuery(0, new ApiError("Database error", { status: 400 })),
		).toBe(false);
	});

	it("retains the default retry limit for other errors", () => {
		const error = new ApiError("Unavailable", { status: 503 });
		expect(retryStudyPlanQuery(0, error)).toBe(true);
		expect(retryStudyPlanQuery(2, error)).toBe(true);
		expect(retryStudyPlanQuery(3, error)).toBe(false);
	});
});
