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
  CreateStudyPlanDto,
  UpdateStudyPlanDto,
} from "@repo/shared/schemas/study-plan.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { StudyPlanService } from "./study-plan.service";

@ApiTags("Study Plans")
@ApiBearerAuth("JWT-auth")
@Controller("study-plans")
export class StudyPlanController {
  constructor(private readonly studyPlanService: StudyPlanService) {}

  @Get()
  @ApiOperation({
    summary: "Get all study plans with pagination, search and filters",
  })
  async findAll(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("search") search?: string,
    @Query("student_id") student_id?: string,
    @Query("class_subject_id") class_subject_id?: string,
    @Query("academic_year_id") academic_year_id?: string,
    @Query("department_id") department_id?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const result = await this.studyPlanService.findAll(
      pageNumber,
      limitNumber,
      {
        search,
        student_id,
        class_subject_id,
        academic_year_id,
        department_id,
      },
    );
    return ResponseHelper.success(
      result.data,
      "Study plans retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a study plan by ID" })
  async findOne(@Param("id") id: string) {
    return ResponseHelper.success(
      await this.studyPlanService.findOne(id),
      "Study plan detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a study plan" })
  async create(@Body(new ZodValidationPipe()) dto: CreateStudyPlanDto) {
    return ResponseHelper.success(
      await this.studyPlanService.create(dto),
      "Study plan created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a study plan" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateStudyPlanDto,
  ) {
    return ResponseHelper.success(
      await this.studyPlanService.update(id, dto),
      "Study plan updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete a study plan" })
  async remove(@Param("id") id: string) {
    return ResponseHelper.success(
      await this.studyPlanService.remove(id),
      "Study plan deleted successfully",
    );
  }
}
