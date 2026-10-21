import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import {
  CreateSpecializationDto,
  UpdateSpecializationDto,
} from "@repo/shared/schemas/specialization.schema";
import { Roles } from "../auth/roles.decorator";
import { SpecializationService } from "./specialization.service";

@ApiTags("Specializations")
@ApiBearerAuth("JWT-auth")
// Specializations are managed by institution owners (Admin). Superadmin
// platform accounts and other roles are excluded by the global RolesGuard.
@Roles("admin")
@Controller("specializations")
export class SpecializationController {
  constructor(private readonly specializationService: SpecializationService) {}

  @Get()
  @ApiOperation({ summary: "Get specializations for the authenticated institution" })
  async findAll() {
    const specializations = await this.specializationService.findAll();
    return ResponseHelper.success(
      specializations,
      "Specializations retrieved successfully",
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get specialization by ID" })
  async findOne(@Param("id") id: string) {
    const specialization = await this.specializationService.findOne(id);
    return ResponseHelper.success(
      specialization,
      "Specialization detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a new specialization" })
  async create(@Body() createSpecializationDto: CreateSpecializationDto) {
    const specialization = await this.specializationService.create(
      createSpecializationDto,
    );
    return ResponseHelper.success(
      specialization,
      "Specialization created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an existing specialization" })
  async update(
    @Param("id") id: string,
    @Body() updateSpecializationDto: UpdateSpecializationDto,
  ) {
    const specialization = await this.specializationService.update(
      id,
      updateSpecializationDto,
    );
    return ResponseHelper.success(
      specialization,
      "Specialization updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a specialization" })
  async remove(@Param("id") id: string) {
    const result = await this.specializationService.remove(id);
    return ResponseHelper.success(
      result,
      "Specialization deleted successfully",
    );
  }
}
