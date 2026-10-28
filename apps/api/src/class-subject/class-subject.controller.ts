import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import {
  CreateClassSubjectDto,
  ClassSubjectQueryDto,
  UpdateClassSubjectDto,
} from "@repo/shared/schemas/class-subject.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { ClassSubjectService } from "./class-subject.service";

@ApiTags("Class Subjects")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("class-subjects")
export class ClassSubjectController {
  constructor(private readonly classSubjectService: ClassSubjectService) {}

  @Get()
  @ApiOperation({
    summary:
      "Get all class subjects with eager loading relations, pagination and search",
  })
  async findAll(
    @Req() request: Request & { user: { sub: string } },
    @Query(new ZodValidationPipe()) query: ClassSubjectQueryDto,
  ) {
    const result = await this.classSubjectService.findAll(
      query.page,
      query.limit,
      {
        ...(query.search !== undefined ? { search: query.search } : {}),
        ...(query.class_id !== undefined ? { class_id: query.class_id } : {}),
        ...(query.academic_year_id !== undefined
          ? { academic_year_id: query.academic_year_id }
          : {}),
        ...(query.teacher_id !== undefined ? { teacher_id: query.teacher_id } : {}),
      },
      request.user.sub,
    );

    return ResponseHelper.success(
      result.data,
      "Class subjects retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get("class/:classId")
  @ApiOperation({ summary: "Get class subjects by class ID" })
  async findByClass(
    @Param("classId") classId: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const result = await this.classSubjectService.findByClass(
      classId,
      request.user.sub,
    );
    return ResponseHelper.success(
      result,
      "Class subjects by class retrieved successfully",
    );
  }

  @Get("subject/:subjectId")
  @ApiOperation({ summary: "Get class subjects by subject ID" })
  async findBySubject(
    @Param("subjectId") subjectId: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const result = await this.classSubjectService.findBySubject(
      subjectId,
      request.user.sub,
    );
    return ResponseHelper.success(
      result,
      "Class subjects by subject retrieved successfully",
    );
  }

  @Get("teacher/:teacherId")
  @ApiOperation({ summary: "Get class subjects by teacher ID" })
  async findByTeacher(
    @Param("teacherId") teacherId: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const result = await this.classSubjectService.findByTeacher(
      teacherId,
      request.user.sub,
    );
    return ResponseHelper.success(
      result,
      "Class subjects by teacher retrieved successfully",
    );
  }

  @Get("academic-year/:academicYearId")
  @ApiOperation({ summary: "Get class subjects by academic year ID" })
  async findByAcademicYear(
    @Param("academicYearId") academicYearId: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const result = await this.classSubjectService.findByAcademicYear(
      academicYearId,
      request.user.sub,
    );
    return ResponseHelper.success(
      result,
      "Class subjects by academic year retrieved successfully",
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a class subject relation by ID" })
  async findOne(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const result = await this.classSubjectService.findOne(id, request.user.sub);
    return ResponseHelper.success(
      result,
      "Class subject detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a new class subject relation" })
  async create(
    @Body(new ZodValidationPipe()) dto: CreateClassSubjectDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const result = await this.classSubjectService.create(dto, request.user.sub);
    return ResponseHelper.success(
      result,
      "Class subject created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an existing class subject relation" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateClassSubjectDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const result = await this.classSubjectService.update(
      id,
      dto,
      request.user.sub,
    );
    return ResponseHelper.success(result, "Class subject updated successfully");
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete (soft-delete) a class subject relation" })
  async remove(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const result = await this.classSubjectService.remove(id, request.user.sub);
    return ResponseHelper.success(result, "Class subject deleted successfully");
  }
}
