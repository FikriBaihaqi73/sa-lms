export type TargetAudience = "ALL" | "TEACHER" | "STUDENT";
export type AnnouncementCategory =
  | "GENERAL"
  | "ACADEMIC"
  | "EVENT"
  | "IMPORTANT";

export interface ParsedAnnouncementContent {
  body: string;
  targetAudience: TargetAudience;
  category: AnnouncementCategory;
}

export function parseAnnouncementContent(
  rawContent?: string | null,
): ParsedAnnouncementContent {
  if (!rawContent || !rawContent.trim()) {
    return {
      body: "",
      targetAudience: "ALL",
      category: "GENERAL",
    };
  }

  const trimmed = rawContent.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "object" && parsed !== null) {
        const targetAudience: TargetAudience =
          parsed.targetAudience === "TEACHER" ||
          parsed.targetAudience === "STUDENT"
            ? parsed.targetAudience
            : "ALL";

        const category: AnnouncementCategory =
          parsed.category === "ACADEMIC" ||
          parsed.category === "EVENT" ||
          parsed.category === "IMPORTANT"
            ? parsed.category
            : "GENERAL";

        const body =
          typeof parsed.body === "string"
            ? parsed.body
            : typeof parsed.content === "string"
              ? parsed.content
              : "";

        return {
          body,
          targetAudience,
          category,
        };
      }
    } catch {
      // Fallback to plain text if JSON parse fails
    }
  }

  return {
    body: rawContent,
    targetAudience: "ALL",
    category: "GENERAL",
  };
}

export function formatAnnouncementContent(
  body: string,
  targetAudience: TargetAudience = "ALL",
  category: AnnouncementCategory = "GENERAL",
): string {
  return JSON.stringify({
    body: body ?? "",
    targetAudience,
    category,
  });
}
