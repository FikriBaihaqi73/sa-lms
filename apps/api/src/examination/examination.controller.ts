import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import {
  CreateExaminationDto,
  ExaminationQueryDto,
  UpdateExaminationDto,
} from "@repo/shared/schemas/examination.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { ExaminationService } from "./examination.service";

type AuthenticatedRequest = Request & { user: { sub: string } };

@ApiTags("Examinations")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("examinations")
export class ExaminationController {
  constructor(private readonly service: ExaminationService) {}

  @Post()
  @ApiOperation({ summary: "Menambahkan ujian baru" })
  async create(
    @Req() request: AuthenticatedRequest,
    @Body(new ZodValidationPipe()) data: CreateExaminationDto,
  ) {
    return ResponseHelper.success(
      await this.service.create(data, request.user),
      "Ujian berhasil ditambahkan.",
      201,
    );
  }

  @Get()
  @ApiOperation({
    summary: "Menampilkan daftar ujian dengan filter dan pagination",
  })
  async findAll(
    @Req() request: AuthenticatedRequest,
    @Query(new ZodValidationPipe()) query: ExaminationQueryDto,
  ) {
    return ResponseHelper.success(
      await this.service.findAll(query, request.user),
      "Daftar ujian berhasil dimuat.",
    );
  }

  @Get("stats")
  @ApiOperation({ summary: "Menampilkan statistik ujian" })
  async stats(@Req() request: AuthenticatedRequest) {
    return ResponseHelper.success(
      await this.service.stats(request.user),
      "Statistik ujian berhasil dimuat.",
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Menampilkan detail ujian" })
  async findById(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ) {
    return ResponseHelper.success(
      await this.service.findById(id, request.user),
      "Detail ujian berhasil dimuat.",
    );
  }

  @Put(":id")
  @ApiOperation({ summary: "Memperbarui ujian" })
  async update(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) data: UpdateExaminationDto,
  ) {
    return ResponseHelper.success(
      await this.service.update(id, data, request.user),
      "Ujian berhasil diperbarui.",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Menghapus ujian secara soft delete" })
  async delete(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return ResponseHelper.success(
      await this.service.softDelete(id, request.user),
      "Ujian berhasil dihapus.",
    );
  }
}
