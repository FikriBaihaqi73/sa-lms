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
  CreateAttendanceStatusDto,
  UpdateAttendanceStatusDto,
} from "@repo/shared/schemas/attendance-status.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { AttendanceStatusService } from "./attendance-status.service";

@ApiTags("Attendance Statuses")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("attendance-statuses")
export class AttendanceStatusController {
  constructor(
    private readonly attendanceStatusService: AttendanceStatusService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all attendance statuses" })
  async findAll(
    @Req() req: Request & { user: { sub: string } },
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const result = await this.attendanceStatusService.findAll(
      pageNumber,
      limitNumber,
      search,
      req.user.sub,
    );
    return ResponseHelper.success(
      result.data,
      "Attendance statuses retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get attendance status by ID" })
  async findOne(
    @Param("id") id: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return ResponseHelper.success(
      await this.attendanceStatusService.findOne(id, req.user.sub),
      "Attendance status detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a new attendance status" })
  async create(
    @Body(new ZodValidationPipe()) dto: CreateAttendanceStatusDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return ResponseHelper.success(
      await this.attendanceStatusService.create(dto, req.user.sub),
      "Attendance status created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an existing attendance status" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateAttendanceStatusDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return ResponseHelper.success(
      await this.attendanceStatusService.update(id, dto, req.user.sub),
      "Attendance status updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an attendance status" })
  async remove(
    @Param("id") id: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return ResponseHelper.success(
      await this.attendanceStatusService.remove(id, req.user.sub),
      "Attendance status deleted successfully",
    );
  }
}
