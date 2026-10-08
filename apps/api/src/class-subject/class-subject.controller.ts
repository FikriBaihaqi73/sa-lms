import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import {
  CreateClassSubjectDto,
  UpdateClassSubjectDto,
} from "@repo/shared/schemas/class-subject.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { ClassSubjectService } from "./class-subject.service";

@ApiTags("Class Subjects")
@ApiBearerAuth("JWT-auth")
@Controller("class-subjects")
export class ClassSubjectController {
  constructor(private readonly classSubjectService: ClassSubjectService) {}

  @Get()
  @ApiOperation({
    summary:
      "Get all class subjects with eager loading relations, pagination and search",
  })
  async findAll(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const result = await this.classSubjectService.findAll(
      pageNumber,
      limitNumber,
      search,
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
  async findByClass(@Param("classId") classId: string) {
    const result = await this.classSubjectService.findByClass(classId);
    return ResponseHelper.success(
      result,
      "Class subjects by class retrieved successfully",
    );
  }

  @Get("subject/:subjectId")
  @ApiOperation({ summary: "Get class subjects by subject ID" })
  async findBySubject(@Param("subjectId") subjectId: string) {
    const result = await this.classSubjectService.findBySubject(subjectId);
    return ResponseHelper.success(
      result,
      "Class subjects by subject retrieved successfully",
    );
  }

  @Get("teacher/:teacherId")
  @ApiOperation({ summary: "Get class subjects by teacher ID" })
  async findByTeacher(@Param("teacherId") teacherId: string) {
    const result = await this.classSubjectService.findByTeacher(teacherId);
    return ResponseHelper.success(
      result,
      "Class subjects by teacher retrieved successfully",
    );
  }

  @Get("academic-year/:academicYearId")
  @ApiOperation({ summary: "Get class subjects by academic year ID" })
  async findByAcademicYear(@Param("academicYearId") academicYearId: string) {
    const result =
      await this.classSubjectService.findByAcademicYear(academicYearId);
    return ResponseHelper.success(
      result,
      "Class subjects by academic year retrieved successfully",
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a class subject relation by ID" })
  async findOne(@Param("id") id: string) {
    const result = await this.classSubjectService.findOne(id);
    return ResponseHelper.success(
      result,
      "Class subject detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a new class subject relation" })
  async create(@Body(new ZodValidationPipe()) dto: CreateClassSubjectDto) {
    const result = await this.classSubjectService.create(dto);
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
  ) {
    const result = await this.classSubjectService.update(id, dto);
    return ResponseHelper.success(result, "Class subject updated successfully");
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete (soft-delete) a class subject relation" })
  async remove(@Param("id") id: string) {
    const result = await this.classSubjectService.remove(id);
    return ResponseHelper.success(result, "Class subject deleted successfully");
  }
}
