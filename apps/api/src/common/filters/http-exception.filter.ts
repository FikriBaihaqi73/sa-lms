import { Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.message;
      response.status(status).json({
        status: "error",
        message,
        data: null,
        code: status,
      });
      return;
    }

    const prismaError = exception as { code?: string; message?: string };
    if (prismaError?.code) {
      let message = "Terjadi kesalahan pada database.";
      if (prismaError.code === "P2002") {
        message = "Data duplikat. Silakan periksa kembali.";
      } else if (prismaError.code === "P2003") {
        message = "Data referensi tidak ditemukan.";
      }
      response.status(HttpStatus.BAD_REQUEST).json({
        status: "error",
        message,
        data: null,
        code: HttpStatus.BAD_REQUEST,
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Terjadi kesalahan internal server.",
      data: null,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
