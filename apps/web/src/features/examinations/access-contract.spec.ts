import { describe, expect, it } from "vitest";
import sidebarSource from "../../components/app-sidebar.tsx?raw";
import rootSource from "../../routes/__root.tsx?raw";

describe("examinations access contract", () => {
  it("requires an explicit institution admin role", () => {
    expect(rootSource).toContain('"/examinations"');
    expect(rootSource).toContain("!hasExplicitAdminRole");
  });

  it("shows the sidebar item only for an explicit admin", () => {
    expect(sidebarSource).toContain('to="/examinations"');
    expect(sidebarSource).toContain("hasExplicitAdminRole &&");
  });
});
