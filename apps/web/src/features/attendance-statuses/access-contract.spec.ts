import { describe, expect, it } from "vitest";
import sidebarSource from "../../components/app-sidebar.tsx?raw";
import rootSource from "../../routes/__root.tsx?raw";

describe("attendance-status access contract", () => {
  it("protects the route as an institution-admin route", () => {
    expect(rootSource).toContain('"/attendance-statuses"');
    expect(rootSource).toContain("const isInstitutionAdminOnlyRoute");
    const superadminSection = rootSource.split(
      "const ADMIN_ACCESSIBLE_PREFIXES",
    )[0];
    expect(superadminSection).not.toContain('"/attendance-statuses"');
  });

  it("shows the menu only to an explicit institution admin", () => {
    expect(sidebarSource).toContain(
      'hasExplicitAdminRole && <NavItem to="/attendance-statuses"',
    );
  });
});
