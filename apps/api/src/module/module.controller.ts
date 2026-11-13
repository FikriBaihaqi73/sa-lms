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
  CreateModuleDto,
  UpdateModuleDto,
} from "@repo/shared/schemas/module.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { LearningModuleService } from "./module.service";

@ApiTags("Learning Modules")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("modules")
export class LearningModuleController {
  constructor(private readonly learningModuleService: LearningModuleService) {}

  @Get()
  @ApiOperation({
    summary: "Get all learning modules with pagination and search",
  })
  async findAll(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("search") search?: string,
    @Query("class_subject_id") class_subject_id?: string,
    @Query("is_published") is_published?: string,
    @Query("is_locked") is_locked?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    const result = await this.learningModuleService.findAll(
      pageNumber,
      limitNumber,
      {
        search,
        class_subject_id: class_subject_id || undefined,
        is_published:
          is_published !== undefined && is_published !== ""
            ? is_published === "true"
            : undefined,
        is_locked:
          is_locked !== undefined && is_locked !== ""
            ? is_locked === "true"
            : undefined,
      },
    );
    return ResponseHelper.success(
      result.data,
      "Learning modules retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a learning module by ID" })
  async findOne(@Param("id") id: string) {
    return ResponseHelper.success(
      await this.learningModuleService.findOne(id),
      "Learning module detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a learning module" })
  async create(@Body(new ZodValidationPipe()) dto: CreateModuleDto) {
    return ResponseHelper.success(
      await this.learningModuleService.create(dto),
      "Learning module created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a learning module" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateModuleDto,
  ) {
    return ResponseHelper.success(
      await this.learningModuleService.update(id, dto),
      "Learning module updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete a learning module" })
  async remove(@Param("id") id: string) {
    return ResponseHelper.success(
      await this.learningModuleService.remove(id),
      "Learning module deleted successfully",
    );
  }
}
