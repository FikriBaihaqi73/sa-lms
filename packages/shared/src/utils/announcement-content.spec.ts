import {
  formatAnnouncementContent,
  parseAnnouncementContent,
} from "./announcement-content";

describe("announcement-content utils", () => {
  it("formats and parses JSON announcement content correctly", () => {
    const formatted = formatAnnouncementContent(
      "Ujian Akhir Semester akan dimulai tanggal 1 Desember.",
      "STUDENT",
      "ACADEMIC",
    );

    const parsed = parseAnnouncementContent(formatted);
    expect(parsed.body).toBe(
      "Ujian Akhir Semester akan dimulai tanggal 1 Desember.",
    );
    expect(parsed.targetAudience).toBe("STUDENT");
    expect(parsed.category).toBe("ACADEMIC");
  });

  it("handles legacy plain text gracefully by falling back to ALL and GENERAL", () => {
    const parsed = parseAnnouncementContent("Plain announcement content text");
    expect(parsed.body).toBe("Plain announcement content text");
    expect(parsed.targetAudience).toBe("ALL");
    expect(parsed.category).toBe("GENERAL");
  });

  it("handles null and empty content without throwing", () => {
    const parsedNull = parseAnnouncementContent(null);
    expect(parsedNull.body).toBe("");
    expect(parsedNull.targetAudience).toBe("ALL");
    expect(parsedNull.category).toBe("GENERAL");

    const parsedEmpty = parseAnnouncementContent("   ");
    expect(parsedEmpty.body).toBe("");
    expect(parsedEmpty.targetAudience).toBe("ALL");
    expect(parsedEmpty.category).toBe("GENERAL");
  });

  it("handles invalid JSON string gracefully", () => {
    const parsed = parseAnnouncementContent("{ invalid json content }");
    expect(parsed.body).toBe("{ invalid json content }");
    expect(parsed.targetAudience).toBe("ALL");
    expect(parsed.category).toBe("GENERAL");
  });
});
