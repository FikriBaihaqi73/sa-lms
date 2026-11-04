import { describe, expect, it } from "vitest";
import sidebar from "../../components/app-sidebar.tsx?raw";
import root from "../../routes/__root.tsx?raw";
describe("access contract", () => {
  it("restricts the route and menu to admin", () => {
    expect(root).toContain('"/teaching-journals"');
    expect(root).toContain('!isInstitutionAdmin');
    expect(sidebar).toMatch(/hasExplicitAdminRole\s*&&\s*<NavItem to="\/teaching-journals"/);
  });
});
