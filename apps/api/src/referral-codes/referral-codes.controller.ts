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
import {
  CreateReferralCodeDto,
  QueryReferralCodeDto,
  UpdateReferralCodeDto,
} from "@repo/shared/schemas/referral-codes.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { ReferralCodesService } from "./referral-codes.service";

@ApiTags("Referral Codes")
@ApiBearerAuth("JWT-auth")
@Roles("admin", "superadmin")
@Controller("referral-codes")
export class ReferralCodesController {
  constructor(private readonly service: ReferralCodesService) {}

  @Post()
  @ApiOperation({
    summary: "Buat kode referral baru dengan kuota dan pengaturan opsional",
  })
  async create(
    @Body(new ZodValidationPipe()) dto: CreateReferralCodeDto,
    @Req() req: Request & { user?: { sub?: string } },
  ) {
    return this.service.create(dto, req.user?.sub);
  }

  @Get()
  @ApiOperation({
    summary:
      "Ambil daftar kode referral institusi dengan filter status dan pencarian",
  })
  async findAll(
    @Query(new ZodValidationPipe()) query: QueryReferralCodeDto,
    @Req() req: Request & { user?: { sub?: string } },
  ) {
    return this.service.findAll(query, req.user?.sub);
  }

  @Get(":id")
  @ApiOperation({ summary: "Ambil detail kode referral berdasarkan ID" })
  async findById(@Param("id") id: string) {
    return this.service.findById(id);
  }

  @Patch(":id")
  @ApiOperation({
    summary:
      "Perbarui pengaturan kode referral (kuota, jurusan, tanggal kedaluwarsa)",
  })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateReferralCodeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(":id/toggle")
  @ApiOperation({ summary: "Aktifkan atau nonaktifkan kode referral" })
  async toggleActive(@Param("id") id: string) {
    return this.service.toggleActive(id);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Hapus atau nonaktifkan kode referral (soft delete)",
  })
  async delete(@Param("id") id: string) {
    return this.service.delete(id);
  }
}
