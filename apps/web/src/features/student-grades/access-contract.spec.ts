import { describe, expect, it } from "vitest";
import sidebarSource from "../../components/app-sidebar.tsx?raw";
import rootSource from "../../routes/__root.tsx?raw";

describe("student-grades access contract", () => {
  it("requires explicit institution admin access", () => {
    expect(rootSource).toContain('"/student-grades"');
    expect(rootSource).toContain("location.pathname.startsWith(\"/student-grades\")");
    expect(rootSource).toContain("!hasExplicitAdminRole");
  });
  it("shows the menu only for explicit admins", () => {
    expect(sidebarSource).toContain('to="/student-grades"');
    expect(sidebarSource).toContain("hasExplicitAdminRole &&");
  });
});
