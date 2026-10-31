import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import {
  CreateScheduleDto,
  UpdateScheduleDto,
} from "@repo/shared/schemas/schedule.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { ScheduleService } from "./schedule.service";

@ApiTags("Schedules")
@ApiBearerAuth("JWT-auth")
@Roles("admin", "superadmin")
@Controller("schedules")
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @ApiOperation({ summary: "Get all schedules with pagination and search" })
  async findAll(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("search") search?: string,
    @Query("day") day?: string,
    @Query("classroomId") classroomId?: string,
    @Query("classSubjectId") classSubjectId?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const result = await this.scheduleService.findAll(pageNumber, limitNumber, {
      search,
      day,
      classroomId,
      classSubjectId,
    });

    return ResponseHelper.success(
      result.data,
      "Schedules retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a schedule by ID" })
  async findOne(@Param("id") id: string) {
    const schedule = await this.scheduleService.findOne(id);
    return ResponseHelper.success(
      schedule,
      "Schedule detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a schedule" })
  async create(@Body(new ZodValidationPipe()) dto: CreateScheduleDto) {
    const schedule = await this.scheduleService.create(dto);
    return ResponseHelper.success(
      schedule,
      "Schedule created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a schedule" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateScheduleDto,
  ) {
    const schedule = await this.scheduleService.update(id, dto);
    return ResponseHelper.success(schedule, "Schedule updated successfully");
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete a schedule" })
  async remove(@Param("id") id: string) {
    const result = await this.scheduleService.remove(id);
    return ResponseHelper.success(result, "Schedule deleted successfully");
  }
}
