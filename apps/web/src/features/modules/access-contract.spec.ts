import { describe, expect, it } from "vitest";
import sidebar from "../../components/app-sidebar.tsx?raw";
import root from "../../routes/__root.tsx?raw";

describe("modules access contract", () => {
	it("restricts the route to institution admin", () => {
		expect(root).toContain('"/modules"');
		expect(root).toContain("!isInstitutionAdmin");
	});

	it("renders the sidebar item for institution admin", () => {
		expect(sidebar).toContain('to="/modules"');
		expect(sidebar).toContain('label="Modul & Konten Materi"');
	});
});


