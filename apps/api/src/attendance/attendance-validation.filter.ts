import { type ArgumentsHost, BadRequestException, Catch, type ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";
import { ZodValidationException } from "nestjs-zod";
import { ZodError } from "zod";

/** Global DTO validation runs before parameter pipes; normalize it for this feature too. */
@Catch(ZodValidationException)
export class AttendanceValidationFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const error = exception.getZodError();
    const response = new BadRequestException({
      status: "error", code: 400, message: "Validation failed",
      errors: error instanceof ZodError ? error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })) : [],
    });
    host.switchToHttp().getResponse<Response>().status(400).json(response.getResponse());
  }
}
