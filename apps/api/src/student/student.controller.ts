import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  CreateStudentDto,
  UpdateStudentDto,
} from "@repo/shared/schemas/student.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { StudentService } from "./student.service";

@ApiTags("Students")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("students")
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @ApiOperation({ summary: "Create a student" })
  create(
    @Body(new ZodValidationPipe()) createStudentDto: CreateStudentDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return this.studentService.create(createStudentDto, request.user.sub);
  }

  @Get()
  @ApiOperation({ summary: "Get students with search and pagination" })
  findAll(
    @Req() request: Request & { user: { sub: string } },
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
    @Query("search") search?: string,
  ) {
    return this.studentService.findAll(request.user.sub, page, limit, search);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get student by ID" })
  findById(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return this.studentService.findById(request.user.sub, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a student" })
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) updateStudentDto: UpdateStudentDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return this.studentService.update(request.user.sub, id, updateStudentDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a student" })
  delete(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return this.studentService.delete(request.user.sub, id);
  }
}
