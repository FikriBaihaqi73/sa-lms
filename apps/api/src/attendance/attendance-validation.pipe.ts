import { BadRequestException } from "@nestjs/common";
import { createZodValidationPipe } from "nestjs-zod";
import { ZodError } from "zod";

export const AttendanceValidationPipe = createZodValidationPipe({
  createValidationException: (error) => new BadRequestException({
    status: "error",
    code: 400,
    message: "Validation failed",
    errors: error instanceof ZodError ? error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })) : [],
  }),
});
