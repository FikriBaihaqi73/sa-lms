import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const AnnouncementTargetAudienceSchema = z
  .enum(["ALL", "TEACHER", "STUDENT"])
  .describe("Target audience for the announcement");

export const AnnouncementCategorySchema = z
  .enum(["GENERAL", "ACADEMIC", "EVENT", "IMPORTANT"])
  .describe("Category of the announcement");

export const CreateAnnouncementSchema = z.object({
  institutionId: z
    .string()
    .uuid("Invalid institution ID format")
    .optional()
    .describe("ID of the institution (inferred automatically if omitted)"),
  title: z
    .string()
    .min(1, "Judul pengumuman wajib diisi")
    .max(255, "Judul tidak boleh melebihi 255 karakter")
    .describe("Title of the announcement"),
  content: z.string().optional().describe("Content of the announcement"),
  targetAudience: AnnouncementTargetAudienceSchema.optional()
    .default("ALL")
    .describe("Target recipient audience (ALL, TEACHER, STUDENT)"),
  category: AnnouncementCategorySchema.optional()
    .default("GENERAL")
    .describe(
      "Category of the announcement (GENERAL, ACADEMIC, EVENT, IMPORTANT)",
    ),
  isPublished: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether the announcement is published"),
  publishedAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .describe("Date and time when the announcement was published"),
  expiredAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .describe("Date and time when the announcement expires"),
});

export const UpdateAnnouncementSchema = CreateAnnouncementSchema.partial();

export const QueryAnnouncementSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
  targetAudience: AnnouncementTargetAudienceSchema.optional(),
  category: AnnouncementCategorySchema.optional(),
  institutionId: z.string().uuid().optional(),
});

export const createAnnouncementSchema = CreateAnnouncementSchema;
export const updateAnnouncementSchema = UpdateAnnouncementSchema;

export class CreateAnnouncementDto extends createZodDto(
  CreateAnnouncementSchema,
) {}
export class UpdateAnnouncementDto extends createZodDto(
  UpdateAnnouncementSchema,
) {}
export class QueryAnnouncementDto extends createZodDto(
  QueryAnnouncementSchema,
) {}
