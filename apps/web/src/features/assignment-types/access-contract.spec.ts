import { describe, expect, it } from "vitest";
import sidebarSource from "../../components/app-sidebar.tsx?raw";
import rootSource from "../../routes/__root.tsx?raw";

describe("assignment-types access contract", () => {
  it("protects the route as an institution-admin route", () => {
    expect(rootSource).toContain('"/assignment-types"');
    expect(rootSource).toContain("const isInstitutionAdminOnlyRoute");
    const superadminSection = rootSource.split(
      "const ADMIN_ACCESSIBLE_PREFIXES",
    )[0];
    expect(superadminSection).not.toContain('"/assignment-types"');
  });

  it("shows the menu in the academic configuration section for institution admin", () => {
    expect(sidebarSource).toContain('to="/assignment-types"');
    expect(sidebarSource).toContain('label="Jenis Tugas"');
    // Superadmin section should not have assignment-types
    const superadminSection = sidebarSource.split(
      "INSTITUTION ADMIN SECTION",
    )[0];
    expect(superadminSection).not.toContain('to="/assignment-types"');
  });
});
