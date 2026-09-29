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
  CreatePermissionDto,
  UpdatePermissionDto,
} from "@repo/shared/schemas/permission.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { Public } from "../auth/public.decorator";
import { PermissionService } from "./permission.service";

@ApiTags("Permissions")
@ApiBearerAuth("JWT-auth")
@Controller("permissions")
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Get all permissions" })
  async findAll() {
    const permissions = await this.permissionService.findAll();
    return ResponseHelper.success(
      permissions,
      "Permissions retrieved successfully",
    );
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Get permission by ID" })
  async findOne(@Param("id") id: string) {
    const permission = await this.permissionService.findOne(id);
    return ResponseHelper.success(
      permission,
      "Permission detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a new permission" })
  async create(
    @Body(new ZodValidationPipe()) createPermissionDto: CreatePermissionDto,
  ) {
    const permission = await this.permissionService.create(createPermissionDto);
    return ResponseHelper.success(
      permission,
      "Permission created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an existing permission" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) updatePermissionDto: UpdatePermissionDto,
  ) {
    const permission = await this.permissionService.update(
      id,
      updatePermissionDto,
    );
    return ResponseHelper.success(
      permission,
      "Permission updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a permission" })
  async remove(@Param("id") id: string) {
    const result = await this.permissionService.remove(id);
    return ResponseHelper.success(result, "Permission deleted successfully");
  }
}
