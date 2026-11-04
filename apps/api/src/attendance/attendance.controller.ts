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
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from "@repo/shared/schemas/attendance.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { AttendanceService } from "./attendance.service";

@ApiTags("Attendances")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("attendances")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get("summary")
  @ApiOperation({
    summary: "Get attendance summary statistics (total, present, permission, sick, absent)",
  })
  async getSummary(
    @Req() req: Request & { user: { sub: string } },
    @Query("search") search?: string,
    @Query("schedule_id") schedule_id?: string,
    @Query("student_id") student_id?: string,
    @Query("attendance_status_id") attendance_status_id?: string,
    @Query("attendance_date") attendance_date?: string,
    @Query("class_id") class_id?: string,
  ) {
    const summary = await this.attendanceService.getSummary(
      {
        search,
        schedule_id,
        student_id,
        attendance_status_id,
        attendance_date,
        class_id,
      },
      req.user.sub,
    );
    return ResponseHelper.success(
      summary,
      "Attendance summary retrieved successfully",
    );
  }

  @Get()
  @ApiOperation({
    summary: "Get all attendance records with pagination, search and filters",
  })
  async findAll(
    @Req() req: Request & { user: { sub: string } },
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("search") search?: string,
    @Query("schedule_id") schedule_id?: string,
    @Query("student_id") student_id?: string,
    @Query("attendance_status_id") attendance_status_id?: string,
    @Query("attendance_date") attendance_date?: string,
    @Query("class_id") class_id?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    const result = await this.attendanceService.findAll(
      pageNumber,
      limitNumber,
      {
        search,
        schedule_id,
        student_id,
        attendance_status_id,
        attendance_date,
        class_id,
      },
      req.user.sub,
    );
    return ResponseHelper.success(
      result.data,
      "Attendances retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an attendance record by ID" })
  async findOne(
    @Param("id") id: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    const attendance = await this.attendanceService.findOne(id, req.user.sub);
    return ResponseHelper.success(
      attendance,
      "Attendance detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create an attendance record" })
  async create(
    @Body(new ZodValidationPipe()) dto: CreateAttendanceDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    const attendance = await this.attendanceService.create(dto, req.user.sub);
    return ResponseHelper.success(
      attendance,
      "Attendance created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an attendance record" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateAttendanceDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    const attendance = await this.attendanceService.update(id, dto, req.user.sub);
    return ResponseHelper.success(
      attendance,
      "Attendance updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete an attendance record" })
  async remove(
    @Param("id") id: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    const result = await this.attendanceService.remove(id, req.user.sub);
    return ResponseHelper.success(result, "Attendance deleted successfully");
  }
}
