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
  CreateExaminationScoreDto,
  UpdateExaminationScoreDto,
} from "@repo/shared/schemas/examination-score.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { ExaminationScoreService } from "./examination-score.service";

type AuthenticatedRequest = Request & { user?: { sub?: string } };

@ApiTags("Examination Scores")
@ApiBearerAuth("JWT-auth")
@Controller("examination-scores")
export class ExaminationScoreController {
  constructor(
    private readonly examinationScoreService: ExaminationScoreService,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Get all examination scores with pagination and search",
  })
  async findAll(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    return ResponseHelper.success(
      await this.examinationScoreService.findAll(
        pageNumber,
        limitNumber,
        search,
      ),
      "Examination scores retrieved successfully",
    );
  }

  @Get("examination/:examinationId")
  @ApiOperation({ summary: "Get examination scores by examination ID" })
  async findByExamination(@Param("examinationId") examinationId: string) {
    return ResponseHelper.success(
      await this.examinationScoreService.findByExamination(examinationId),
      "Examination scores retrieved successfully",
    );
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get examination scores by student ID" })
  async findByStudent(@Param("studentId") studentId: string) {
    return ResponseHelper.success(
      await this.examinationScoreService.findByStudent(studentId),
      "Student examination scores retrieved successfully",
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get examination score by ID" })
  async findOne(@Param("id") id: string) {
    return ResponseHelper.success(
      await this.examinationScoreService.findOne(id),
      "Examination score detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a new examination score" })
  async create(
    @Body(new ZodValidationPipe()) dto: CreateExaminationScoreDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const dataWithGrader = {
      ...dto,
      gradedBy: dto.gradedBy ?? req.user?.sub,
      gradedAt: dto.gradedAt ?? new Date().toISOString(),
    };
    return ResponseHelper.success(
      await this.examinationScoreService.create(dataWithGrader),
      "Examination score created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an existing examination score" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateExaminationScoreDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const dataWithGrader = {
      ...dto,
      gradedBy: dto.gradedBy ?? req.user?.sub,
      gradedAt: dto.gradedAt ?? new Date().toISOString(),
    };
    return ResponseHelper.success(
      await this.examinationScoreService.update(id, dataWithGrader),
      "Examination score updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an examination score" })
  async remove(@Param("id") id: string) {
    return ResponseHelper.success(
      await this.examinationScoreService.remove(id),
      "Examination score deleted successfully",
    );
  }
}
