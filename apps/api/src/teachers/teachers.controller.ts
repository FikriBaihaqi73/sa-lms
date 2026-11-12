import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  CreateTeacherDto,
  UpdateTeacherDto,
} from "@repo/shared/schemas/teacher.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { TeachersService } from "./teachers.service";

@ApiTags("Teachers")
@ApiBearerAuth("JWT-auth")
@Roles("admin", "superadmin")
@Controller("teachers")
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @ApiOperation({
    summary:
      "Create a new teacher (1-Step Onboarding: Akun Login + Profil + Data Guru)",
  })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe()) createTeacherDto: CreateTeacherDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return this.teachersService.create(createTeacherDto, request.user.sub);
  }

  @Get()
  @ApiOperation({
    summary: "Retrieve teachers with search, filter, and pagination",
  })
  findAll(
    @Req() request: Request & { user: { sub: string } },
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("specialization") specialization?: string,
  ) {
    return this.teachersService.findAll(
      request.user.sub,
      page ?? 1,
      limit ?? 10,
      search,
      status,
      specialization,
    );
  }

  @Get("stats")
  @ApiOperation({ summary: "Retrieve teacher aggregate stats" })
  getStats(@Req() request: Request & { user: { sub: string } }) {
    return this.teachersService.getStats(request.user.sub);
  }

  @Get(":id")
  @ApiOperation({ summary: "Retrieve a teacher by ID" })
  findById(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return this.teachersService.findById(id, request.user.sub);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update teacher profile, account, or employment details",
  })
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) updateTeacherDto: UpdateTeacherDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return this.teachersService.update(id, updateTeacherDto, request.user.sub);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a teacher" })
  delete(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return this.teachersService.delete(id, request.user.sub);
  }
}
