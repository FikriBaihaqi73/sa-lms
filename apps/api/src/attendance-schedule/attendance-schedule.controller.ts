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
  CreateAttendanceScheduleDto,
  ListAttendanceScheduleQueryDto,
  ToggleAttendanceScheduleStatusDto,
  UpdateAttendanceScheduleDaysDto,
  UpdateAttendanceScheduleDto,
} from "@repo/shared/schemas/attendance-schedule.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { AttendanceScheduleService } from "./attendance-schedule.service";

interface AuthenticatedRequest extends Request {
  user: { sub: string };
}

@ApiTags("Attendance Schedules")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("attendance-schedules")
export class AttendanceScheduleController {
  constructor(
    private readonly attendanceScheduleService: AttendanceScheduleService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      "Mendapatkan daftar jadwal absensi beserta filter, paginasi, dan ringkasan statistik",
  })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query(new ZodValidationPipe()) query: ListAttendanceScheduleQueryDto,
  ) {
    const result = await this.attendanceScheduleService.findAll(
      req.user.sub,
      query,
    );
    return ResponseHelper.success(
      result.data,
      "Attendance schedules retrieved successfully",
      200,
      {
        ...result.meta,
        stats: result.stats,
      },
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Mendapatkan detail jadwal absensi berdasarkan ID" })
  async findOne(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    const data = await this.attendanceScheduleService.findOne(req.user.sub, id);
    return ResponseHelper.success(
      data,
      "Attendance schedule detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Membuat jadwal absensi baru (hybrid)" })
  async create(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe()) dto: CreateAttendanceScheduleDto,
  ) {
    const data = await this.attendanceScheduleService.create(req.user.sub, dto);
    return ResponseHelper.success(
      data,
      "Attendance schedule created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Memperbarui data jadwal absensi secara penuh" })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateAttendanceScheduleDto,
  ) {
    const data = await this.attendanceScheduleService.update(
      req.user.sub,
      id,
      dto,
    );
    return ResponseHelper.success(
      data,
      "Attendance schedule updated successfully",
    );
  }

  @Patch(":id/status")
  @ApiOperation({
    summary: "Mengubah status aktif/nonaktif jadwal absensi secara cepat",
  })
  async toggleStatus(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: ToggleAttendanceScheduleStatusDto,
  ) {
    const data = await this.attendanceScheduleService.toggleStatus(
      req.user.sub,
      id,
      dto.isActive,
    );
    return ResponseHelper.success(
      data,
      "Attendance schedule status updated successfully",
    );
  }

  @Patch(":id/days")
  @ApiOperation({
    summary: "Mengubah daftar hari aktif mingguan jadwal absensi secara cepat",
  })
  async updateDays(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateAttendanceScheduleDaysDto,
  ) {
    const data = await this.attendanceScheduleService.updateDays(
      req.user.sub,
      id,
      dto.activeDays,
    );
    return ResponseHelper.success(
      data,
      "Attendance schedule active days updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Menghapus jadwal absensi (soft delete)" })
  async remove(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    const data = await this.attendanceScheduleService.remove(req.user.sub, id);
    return ResponseHelper.success(
      data,
      "Attendance schedule deleted successfully",
    );
  }
}
