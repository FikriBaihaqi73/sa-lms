import { createZodDto } from "nestjs-zod/dto";
import {
  LoginSchema,
  LogoutSchema,
  RegisterSchema,
} from "./auth-validation.schema";

export { LoginSchema, LogoutSchema, RegisterSchema } from "./auth-validation.schema";

export class RegisterDto extends createZodDto(RegisterSchema) {}
export class LoginDto extends createZodDto(LoginSchema) {}
export class logoutDto extends createZodDto(LogoutSchema) {}
