import { z } from "zod";

export const roleFormSchema = z.object({
  name: z.string().trim().min(2, "Nama role minimal 2 karakter"),
  description: z.string().max(1000, "Deskripsi maksimal 1000 karakter"),
  permissionIds: z
    .array(z.string())
    .min(0),
});
