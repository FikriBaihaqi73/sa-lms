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
  CreateStudyResultDto,
  UpdateStudyResultDto,
} from "@repo/shared/schemas/study-result.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { StudyResultService } from "./study-result.service";

@ApiTags("Study Results")
@ApiBearerAuth("JWT-auth")
@Controller("study-results")
export class StudyResultController {
  constructor(private readonly studyResultService: StudyResultService) {}

  @Get()
  @ApiOperation({
    summary:
      "Get all study results with eager loaded relations, pagination and search",
  })
  async findAll(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const result = await this.studyResultService.findAll(
      pageNumber,
      limitNumber,
      search,
    );

    return ResponseHelper.success(
      result.data,
      "Study results retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a study result record by ID" })
  async findOne(@Param("id") id: string) {
    const result = await this.studyResultService.findOne(id);
    return ResponseHelper.success(
      result,
      "Study result detail retrieved successfully",
    );
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get study results by student ID" })
  async findByStudentId(@Param("studentId") studentId: string) {
    const result = await this.studyResultService.findByStudentId(studentId);
    return ResponseHelper.success(
      result,
      "Study results by student retrieved successfully",
    );
  }

  @Get("academic-year/:academicYearId")
  @ApiOperation({ summary: "Get study results by academic year ID" })
  async findByAcademicYearId(@Param("academicYearId") academicYearId: string) {
    const result =
      await this.studyResultService.findByAcademicYearId(academicYearId);
    return ResponseHelper.success(
      result,
      "Study results by academic year retrieved successfully",
    );
  }

  @Get("semester/:semesterId")
  @ApiOperation({ summary: "Get study results by semester ID" })
  async findBySemesterId(@Param("semesterId") semesterId: string) {
    const result = await this.studyResultService.findBySemesterId(semesterId);
    return ResponseHelper.success(
      result,
      "Study results by semester retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a new study result record" })
  async create(@Body(new ZodValidationPipe()) dto: CreateStudyResultDto) {
    const result = await this.studyResultService.create(dto);
    return ResponseHelper.success(
      result,
      "Study result created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an existing study result record" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateStudyResultDto,
  ) {
    const result = await this.studyResultService.update(id, dto);
    return ResponseHelper.success(result, "Study result updated successfully");
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete (soft-delete) a study result record" })
  async remove(@Param("id") id: string) {
    const result = await this.studyResultService.remove(id);
    return ResponseHelper.success(result, "Study result deleted successfully");
  }
}
