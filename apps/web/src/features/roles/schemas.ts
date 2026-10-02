import { z } from "zod";

export const roleFormSchema = z.object({
  name: z.string().trim().min(2, "Nama role minimal 2 karakter"),
  description: z.string().max(1000, "Deskripsi maksimal 1000 karakter"),
<<<<<<< HEAD
=======
  permissionIds: z
    .array(z.string())
    .min(0),
>>>>>>> 7aa00319f0efecf73e08e282e7fccd9b5fd0fa45
});
