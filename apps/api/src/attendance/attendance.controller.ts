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
  BulkUpsertAttendanceDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  UpsertAttendanceDto,
} from "@repo/shared/schemas/attendance.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { AttendanceService } from "./attendance.service";

@ApiTags("Attendances")
@ApiBearerAuth("JWT-auth")
@Roles("admin", "teacher")
@Controller("attendances")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get("summary")
  @ApiOperation({
    summary:
      "Get attendance summary statistics (total, present, permission, sick, absent, attendanceRate)",
  })
  async getSummary(
    @Req() req: Request & { user: { sub: string } },
    @Query("search") search?: string,
    @Query("schedule_id") schedule_id?: string,
    @Query("student_id") student_id?: string,
    @Query("attendance_status_id") attendance_status_id?: string,
    @Query("attendance_date") attendance_date?: string,
    @Query("class_id") class_id?: string,
    @Query("start_date") start_date?: string,
    @Query("end_date") end_date?: string,
    @Query("month") month?: string,
    @Query("year") year?: string,
  ) {
    const summary = await this.attendanceService.getSummary(
      {
        search,
        schedule_id,
        student_id,
        attendance_status_id,
        attendance_date,
        class_id,
        start_date,
        end_date,
        month: month ? parseInt(month, 10) : undefined,
        year: year ? parseInt(year, 10) : undefined,
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
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
    @Query("schedule_id") schedule_id?: string,
    @Query("student_id") student_id?: string,
    @Query("attendance_status_id") attendance_status_id?: string,
    @Query("attendance_date") attendance_date?: string,
    @Query("class_id") class_id?: string,
    @Query("start_date") start_date?: string,
    @Query("end_date") end_date?: string,
    @Query("month") month?: string,
    @Query("year") year?: string,
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
        start_date,
        end_date,
        month: month ? parseInt(month, 10) : undefined,
        year: year ? parseInt(year, 10) : undefined,
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

  @Post("upsert")
  @ApiOperation({
    summary:
      "Create or update single attendance record by schedule, student, and date",
  })
  async upsert(
    @Body(new ZodValidationPipe()) dto: UpsertAttendanceDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    const attendance = await this.attendanceService.upsert(dto, req.user.sub);
    return ResponseHelper.success(
      attendance,
      "Attendance upserted successfully",
      200,
    );
  }

  @Post("bulk-upsert")
  @ApiOperation({
    summary: "Bulk mark attendance for students on a given schedule and date",
  })
  async bulkUpsert(
    @Body(new ZodValidationPipe()) dto: BulkUpsertAttendanceDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    const attendances = await this.attendanceService.bulkUpsert(
      dto,
      req.user.sub,
    );
    return ResponseHelper.success(
      attendances,
      "Bulk attendance recorded successfully",
      200,
    );
  }

  @Post("bulk")
  @ApiOperation({
    summary: "Bulk mark attendance (alias for bulk-upsert)",
  })
  async bulk(
    @Body(new ZodValidationPipe()) dto: BulkUpsertAttendanceDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.bulkUpsert(dto, req);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an attendance record" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateAttendanceDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    const attendance = await this.attendanceService.update(
      id,
      dto,
      req.user.sub,
    );
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
