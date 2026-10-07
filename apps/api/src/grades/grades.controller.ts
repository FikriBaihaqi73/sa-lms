import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import {
  CreateGradeDto,
  UpdateGradeDto,
} from "@repo/shared/schemas/grade.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { GradeService } from "./grades.service";

@ApiTags("Grades")
@ApiBearerAuth("JWT-auth")
// Grades is open to every operational role; superadmin is excluded on purpose.
@Roles("admin", "teacher", "student", "guardian")
@Controller("grades")
export class GradeController {
  constructor(private readonly gradesService: GradeService) {}

  @Get()
  @ApiOperation({ summary: "Get all grades" })
  async findAll() {
    const grades = await this.gradesService.findAll();
    return ResponseHelper.success(grades, "Grades retrieved successfully");
  }

  @Get(":id")
  @ApiOperation({ summary: "Get grade by ID" })
  async findOne(@Param("id") id: string) {
    const grade = await this.gradesService.findOne(id);
    return ResponseHelper.success(grade, "Grade detail retrieved successfully");
  }

  @Post()
  @ApiOperation({ summary: "Create a new grade" })
  async create(@Body(new ZodValidationPipe()) dto: CreateGradeDto) {
    const grade = await this.gradesService.create(dto);
    return ResponseHelper.success(grade, "Grade created successfully", 201);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an existing grade" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateGradeDto,
  ) {
    const grade = await this.gradesService.update(id, dto);
    return ResponseHelper.success(grade, "Grade updated successfully");
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a grade" })
  async remove(@Param("id") id: string) {
    const result = await this.gradesService.remove(id);
    return ResponseHelper.success(result, "Grade deleted successfully");
  }
}
