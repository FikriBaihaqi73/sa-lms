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
import type { Request } from "express";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import {
  CreateStudentGuardianDto,
  UpdateStudentGuardianDto,
} from "@repo/shared/schemas/student-guardian.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { StudentGuardianService } from "./student-guardian.service";

@ApiTags("Student Guardians")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("student-guardians")
export class StudentGuardianController {
  constructor(
    private readonly studentGuardianService: StudentGuardianService,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Get all student guardian relations with pagination and search",
  })
  async findAll(
    @Req() request: Request & { user: { sub: string } },
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const result = await this.studentGuardianService.findAll(
      request.user.sub, pageNumber,
      limitNumber,
      search,
    );
    return ResponseHelper.success(
      result.data,
      "Student guardian relations retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get("options/students")
  @ApiOperation({ summary: "Get institution-scoped student options for the relation form" })
  async studentOptions(
    @Req() request: Request & { user: { sub: string } },
    @Query("page") page = "1",
    @Query("limit") limit = "20",
    @Query("search") search?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 20;
    const result = await this.studentGuardianService.studentOptions(
      request.user.sub,
      pageNumber,
      limitNumber,
      search,
    );
    return ResponseHelper.success(
      result.data,
      "Student options retrieved successfully",
      200,
      {
        totalData: result.meta.total,
        totalPages: result.meta.totalPages,
        currentPage: result.meta.page,
        perPage: result.meta.limit,
      },
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get student guardian relation by ID" })
  async findOne(@Param("id") id: string, @Req() request: Request & { user: { sub: string } }) {
    return ResponseHelper.success(
      await this.studentGuardianService.findOne(id, request.user.sub),
      "Student guardian relation retrieved successfully",
    );
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get guardians for a specific student" })
  async findByStudentId(@Param("studentId") studentId: string, @Req() request: Request & { user: { sub: string } }) {
    return ResponseHelper.success(
      await this.studentGuardianService.findByStudentId(studentId, request.user.sub),
      "Student guardians retrieved successfully",
    );
  }

  @Get("guardian/:guardianId")
  @ApiOperation({ summary: "Get students for a specific guardian" })
  async findByGuardianId(@Param("guardianId") guardianId: string, @Req() request: Request & { user: { sub: string } }) {
    return ResponseHelper.success(
      await this.studentGuardianService.findByGuardianId(guardianId, request.user.sub),
      "Guardian students retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a new student guardian relation" })
  async create(@Body(new ZodValidationPipe()) dto: CreateStudentGuardianDto, @Req() request: Request & { user: { sub: string } }) {
    return ResponseHelper.success(
      await this.studentGuardianService.create(dto, request.user.sub),
      "Student guardian relation created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an existing student guardian relation" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateStudentGuardianDto, @Req() request: Request & { user: { sub: string } },
  ) {
    return ResponseHelper.success(
      await this.studentGuardianService.update(id, dto, request.user.sub),
      "Student guardian relation updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a student guardian relation" })
  async remove(@Param("id") id: string, @Req() request: Request & { user: { sub: string } }) {
    return ResponseHelper.success(
      await this.studentGuardianService.remove(id, request.user.sub),
      "Student guardian relation deleted successfully",
    );
  }
}
