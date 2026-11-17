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
  CreateAssignmentTypeDto,
  UpdateAssignmentTypeDto,
} from "@repo/shared/schemas/assignment-type.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { AssignmentTypeService } from "./assignment-type.service";

@ApiTags("Assignment Types")
@ApiBearerAuth("JWT-auth")
// Assignment types are managed by institution owners (Admin). Superadmin
// platform accounts and other roles are excluded by the global RolesGuard.
@Roles("admin")
@Controller("assignment-types")
export class AssignmentTypeController {
  constructor(private readonly assignmentTypeService: AssignmentTypeService) {}

  @Get()
  @ApiOperation({ summary: "Get all assignment types" })
  async findAll() {
    return ResponseHelper.success(
      await this.assignmentTypeService.findAll(),
      "Assignment types retrieved successfully",
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an assignment type by ID" })
  async findOne(@Param("id") id: string) {
    return ResponseHelper.success(
      await this.assignmentTypeService.findOne(id),
      "Assignment type detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create an assignment type" })
  async create(@Body(new ZodValidationPipe()) dto: CreateAssignmentTypeDto) {
    return ResponseHelper.success(
      await this.assignmentTypeService.create(dto),
      "Assignment type created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an assignment type" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateAssignmentTypeDto,
  ) {
    return ResponseHelper.success(
      await this.assignmentTypeService.update(id, dto),
      "Assignment type updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete an assignment type" })
  async remove(@Param("id") id: string) {
    return ResponseHelper.success(
      await this.assignmentTypeService.remove(id),
      "Assignment type deleted successfully",
    );
  }
}
