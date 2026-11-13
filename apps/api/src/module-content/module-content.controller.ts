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
  CreateModuleContentDto,
  UpdateModuleContentDto,
} from "@repo/shared/schemas/module-content.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { ModuleContentService } from "./module-content.service";

@ApiTags("Module Contents")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("module-contents")
export class ModuleContentController {
  constructor(private readonly moduleContentService: ModuleContentService) {}

  @Get()
  @ApiOperation({
    summary: "Get all module contents with pagination and search",
  })
  async findAll(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("search") search?: string,
    @Query("moduleId") moduleId?: string,
    @Query("contentType") contentType?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    const result = await this.moduleContentService.findAll(
      pageNumber,
      limitNumber,
      {
        search,
        moduleId: moduleId || undefined,
        contentType: contentType || undefined,
      },
    );
    return ResponseHelper.success(
      result.data,
      "Module contents retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get module content by ID" })
  async findOne(@Param("id") id: string) {
    return ResponseHelper.success(
      await this.moduleContentService.findOne(id),
      "Module content detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create module content" })
  async create(@Body(new ZodValidationPipe()) dto: CreateModuleContentDto) {
    return ResponseHelper.success(
      await this.moduleContentService.create(dto),
      "Module content created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update module content" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateModuleContentDto,
  ) {
    return ResponseHelper.success(
      await this.moduleContentService.update(id, dto),
      "Module content updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete module content" })
  async remove(@Param("id") id: string) {
    return ResponseHelper.success(
      await this.moduleContentService.remove(id),
      "Module content deleted successfully",
    );
  }
}
