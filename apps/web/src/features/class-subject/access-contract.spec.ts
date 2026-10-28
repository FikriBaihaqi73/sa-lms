import { describe, expect, it } from "vitest";
import rootSource from "../../routes/__root.tsx?raw";
import sidebarSource from "../../components/app-sidebar.tsx?raw";

describe("class-subject access contract", () => {
  it("requires an explicit admin role for the route", () => {
    expect(rootSource).toContain(
      'location.pathname.startsWith("/class-subjects") && !hasExplicitAdminRole',
    );
    expect(rootSource).toContain(
      'const hasExplicitAdminRole = user?.role?.trim().toLowerCase() === "admin"',
    );
  });

  it("shows the sidebar item only for an explicit admin role", () => {
    expect(sidebarSource).toContain(
      "{hasExplicitAdminRole && <NavItem",
    );
    expect(sidebarSource).toContain('to="/class-subjects"');
  });
});
