import { describe, expect, it } from "vitest";
import rootSource from "../../routes/__root.tsx?raw";

describe("users access contract", () => {
	it("allows superadmin through the shared admin-level route guard", () => {
		expect(rootSource).toContain('const ADMIN_ACCESSIBLE_PREFIXES = ["/users"');
		expect(rootSource).toContain(
			"if (isAdminLevelRoute && !isAdmin && !isSuperadmin)",
		);
		expect(rootSource).toContain('const isAdmin = role === "admin";');
	});

	it("keeps class-subjects restricted to an explicit admin role", () => {
		expect(rootSource).toContain(
			'location.pathname.startsWith("/class-subjects")',
		);
		expect(rootSource).toContain("!hasExplicitAdminRole");
	});
});
