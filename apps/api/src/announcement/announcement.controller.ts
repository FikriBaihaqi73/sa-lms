import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import {
  CreateAnnouncementDto,
  QueryAnnouncementDto,
  UpdateAnnouncementDto,
} from "@repo/shared/schemas/announcement.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { AnnouncementService } from "./announcement.service";

type AuthenticatedRequest = Request & { user: { sub: string } };

@ApiTags("Announcements")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("announcements")
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Get("stats")
  @ApiOperation({
    summary: "Get announcement statistics for admin institution",
  })
  async getStats(@Req() req: AuthenticatedRequest) {
    const stats = await this.announcementService.stats(req.user);
    return ResponseHelper.success(
      stats,
      "Statistik pengumuman berhasil dimuat.",
    );
  }

  @Get()
  @ApiOperation({
    summary:
      "Get announcements with institution scoping, pagination, filtering, and search",
  })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query(new ZodValidationPipe()) query: QueryAnnouncementDto,
  ) {
    const result = await this.announcementService.findAll(query, req.user);
    return ResponseHelper.success(
      result.data,
      "Daftar pengumuman berhasil dimuat.",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an announcement by ID with relations" })
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return ResponseHelper.success(
      await this.announcementService.findOne(id, req.user),
      "Detail pengumuman berhasil dimuat.",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create an announcement for the admin institution" })
  async create(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe()) dto: CreateAnnouncementDto,
  ) {
    return ResponseHelper.success(
      await this.announcementService.create(dto, req.user),
      "Pengumuman berhasil dibuat.",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an announcement" })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe()) dto: UpdateAnnouncementDto,
  ) {
    return ResponseHelper.success(
      await this.announcementService.update(id, dto, req.user),
      "Pengumuman berhasil diperbarui.",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete an announcement" })
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return ResponseHelper.success(
      await this.announcementService.remove(id, req.user),
      "Pengumuman berhasil dihapus.",
    );
  }
}
