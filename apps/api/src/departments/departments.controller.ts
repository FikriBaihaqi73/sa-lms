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
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "@repo/shared/schemas/department.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { DepartmentsService } from "./departments.service";

@ApiTags("Departments")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("departments")
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({
    summary:
      "Get all departments with pagination and search for the admin's institution",
  })
  async findAll(
    @Req() request: Request & { user: { sub: string } },
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("search") search?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    const result = await this.departmentsService.findAll(
      pageNumber,
      limitNumber,
      {
        search,
      },
      request?.user?.sub,
    );
    return ResponseHelper.success(
      result.data,
      "Departments retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get a department by ID within the admin's institution",
  })
  async findOne(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return ResponseHelper.success(
      await this.departmentsService.findOne(id, request?.user?.sub),
      "Department detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({
    summary: "Create a department within the admin's institution",
  })
  async create(
    @Body(new ZodValidationPipe()) dto: CreateDepartmentDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return ResponseHelper.success(
      await this.departmentsService.create(dto, request?.user?.sub),
      "Department created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update a department within the admin's institution",
  })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateDepartmentDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return ResponseHelper.success(
      await this.departmentsService.update(id, dto, request?.user?.sub),
      "Department updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Soft-delete a department within the admin's institution",
  })
  async remove(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return ResponseHelper.success(
      await this.departmentsService.remove(id, request?.user?.sub),
      "Department deleted successfully",
    );
  }
}
