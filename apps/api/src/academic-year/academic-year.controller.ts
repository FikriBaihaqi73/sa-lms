import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import {
  CreateAcademicYearDto,
  UpdateAcademicYearDto,
} from "@repo/shared/schemas/academic-year.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { AcademicYearService } from "./academic-year.service";

@ApiTags("Academic Years")
@ApiBearerAuth("JWT-auth")
// Academic years belong to an institution, so only the institution owner
// (Admin) manages them. Superadmin platform accounts are excluded.
@Roles("admin")
@Controller("academic-years")
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  @Get()
  @ApiOperation({
    summary: "Get all academic years of the authenticated admin's institution",
  })
  async findAll(@Req() request: Request & { user: { sub: string } }) {
    const academicYears = await this.academicYearService.findAll(
      request.user.sub,
    );
    return ResponseHelper.success(
      academicYears,
      "Academic years retrieved successfully",
    );
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get academic year by ID within the admin's institution",
  })
  async findOne(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const academicYear = await this.academicYearService.findOne(
      id,
      request.user.sub,
    );
    return ResponseHelper.success(
      academicYear,
      "Academic year detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({
    summary: "Create a new academic year for the admin's institution",
  })
  async create(
    @Body(new ZodValidationPipe()) dto: CreateAcademicYearDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const academicYear = await this.academicYearService.create(
      dto,
      request.user.sub,
    );
    return ResponseHelper.success(
      academicYear,
      "Academic year created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update an existing academic year within the admin's institution",
  })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateAcademicYearDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const academicYear = await this.academicYearService.update(
      id,
      dto,
      request.user.sub,
    );
    return ResponseHelper.success(
      academicYear,
      "Academic year updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Delete an academic year within the admin's institution",
  })
  async remove(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const result = await this.academicYearService.remove(id, request.user.sub);
    return ResponseHelper.success(result, "Academic year deleted successfully");
  }
}
