import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudentGradeStats } from "./StudentGradeStats";

describe("StudentGradeStats", () => {
  const stats = { total: 12, complete: 8, incomplete: 4, averageFinalScore: 82.56 };
  it("renders colored cards, descriptions, icons, and formatted average", () => {
    render(<StudentGradeStats stats={stats} isLoading={false} isError={false} />);
    expect(screen.getByText("TOTAL NILAI")).toBeTruthy(); expect(screen.getByText("Seluruh data nilai siswa di institusi ini")).toBeTruthy(); expect(screen.getByText("82.6")).toBeTruthy(); expect(document.querySelectorAll("svg").length).toBeGreaterThan(0);
  });
  it("renders a dash for an empty average", () => { render(<StudentGradeStats stats={{ ...stats, averageFinalScore: null }} isLoading={false} isError={false} />); expect(screen.getByText("-")).toBeTruthy(); });
  it("renders skeleton and error state", () => { const { rerender } = render(<StudentGradeStats isLoading stats={undefined} isError={false} />); expect(document.querySelector(".animate-pulse")).toBeTruthy(); rerender(<StudentGradeStats isLoading={false} stats={undefined} isError />); expect(screen.getByText(/Statistik nilai siswa gagal dimuat/)).toBeTruthy(); });
});
