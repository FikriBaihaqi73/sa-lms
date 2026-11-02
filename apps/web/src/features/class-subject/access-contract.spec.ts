import { describe, expect, it } from "vitest";
import sidebarSource from "../../components/app-sidebar.tsx?raw";
import rootSource from "../../routes/__root.tsx?raw";

describe("class-subject access contract", () => {
	it("requires an explicit admin role for the route", () => {
		expect(rootSource).toContain(
			'location.pathname.startsWith("/class-subjects")',
		);
		expect(rootSource).toContain("!hasExplicitAdminRole");
		expect(rootSource).toContain(
			'const hasExplicitAdminRole = user?.role?.trim().toLowerCase() === "admin"',
		);
	});

	it("shows the sidebar item only for an explicit admin role", () => {
		expect(sidebarSource).toContain("hasExplicitAdminRole &&");
		expect(sidebarSource).toContain('to="/class-subjects"');
	});
});
