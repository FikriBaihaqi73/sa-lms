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
  CreateStudentGradeDto,
  UpdateStudentGradeDto,
} from "@repo/shared/schemas/student-grade.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { StudentGradeService } from "./student-grade.service";

@ApiTags("Student Grades")
@ApiBearerAuth("JWT-auth")
// Student grades are open to every operational role; superadmin is excluded.
@Roles("admin", "teacher", "student", "guardian")
@Controller("student-grades")
export class StudentGradeController {
  constructor(private readonly studentGradeService: StudentGradeService) {}

  @Get()
  @ApiOperation({
    summary:
      "Get all student grades with eager loaded relations, pagination and search",
  })
  async findAll(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const result = await this.studentGradeService.findAll(
      pageNumber,
      limitNumber,
      search,
    );

    return ResponseHelper.success(
      result.data,
      "Student grades retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a student grade record by ID" })
  async findOne(@Param("id") id: string) {
    const result = await this.studentGradeService.findOne(id);
    return ResponseHelper.success(
      result,
      "Student grade detail retrieved successfully",
    );
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get student grades by student ID" })
  async findByStudentId(@Param("studentId") studentId: string) {
    const result = await this.studentGradeService.findByStudentId(studentId);
    return ResponseHelper.success(
      result,
      "Student grades by student retrieved successfully",
    );
  }

  @Get("class-subject/:classSubjectId")
  @ApiOperation({ summary: "Get student grades by class subject ID" })
  async findByClassSubjectId(@Param("classSubjectId") classSubjectId: string) {
    const result =
      await this.studentGradeService.findByClassSubjectId(classSubjectId);
    return ResponseHelper.success(
      result,
      "Student grades by class subject retrieved successfully",
    );
  }

  @Get("academic-year/:academicYearId")
  @ApiOperation({ summary: "Get student grades by academic year ID" })
  async findByAcademicYearId(@Param("academicYearId") academicYearId: string) {
    const result =
      await this.studentGradeService.findByAcademicYearId(academicYearId);
    return ResponseHelper.success(
      result,
      "Student grades by academic year retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a new student grade record" })
  async create(@Body(new ZodValidationPipe()) dto: CreateStudentGradeDto) {
    const result = await this.studentGradeService.create(dto);
    return ResponseHelper.success(
      result,
      "Student grade created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an existing student grade record" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateStudentGradeDto,
  ) {
    const result = await this.studentGradeService.update(id, dto);
    return ResponseHelper.success(result, "Student grade updated successfully");
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete (soft-delete) a student grade record" })
  async remove(@Param("id") id: string) {
    const result = await this.studentGradeService.remove(id);
    return ResponseHelper.success(result, "Student grade deleted successfully");
  }
}
