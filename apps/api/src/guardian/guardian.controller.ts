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
  CreateGuardianDto,
  UpdateGuardianDto,
} from "@repo/shared/schemas/guardian.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { GuardianService } from "./guardian.service";

@ApiTags("Guardians")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("guardians")
export class GuardianController {
  constructor(private readonly guardianService: GuardianService) {}

  @Get()
  @ApiOperation({ summary: "Get all guardians with pagination and search" })
  async findAll(
    @Req() request: Request & { user: { sub: string } },
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("search") search?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const result = await this.guardianService.findAll(request.user.sub, pageNumber, limitNumber, {
      search,
    });

    return ResponseHelper.success(
      result.data,
      "Guardians retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a guardian by ID" })
  async findOne(@Param("id") id: string, @Req() request: Request & { user: { sub: string } }) {
    const guardian = await this.guardianService.findOne(id, request.user.sub);
    return ResponseHelper.success(
      guardian,
      "Guardian detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a guardian" })
  async create(@Body(new ZodValidationPipe()) dto: CreateGuardianDto, @Req() request: Request & { user: { sub: string } }) {
    const guardian = await this.guardianService.create(dto, request.user.sub);
    return ResponseHelper.success(
      guardian,
      "Guardian created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a guardian" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateGuardianDto, @Req() request: Request & { user: { sub: string } },
  ) {
    const guardian = await this.guardianService.update(id, dto, request.user.sub);
    return ResponseHelper.success(guardian, "Guardian updated successfully");
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete a guardian" })
  async remove(@Param("id") id: string, @Req() request: Request & { user: { sub: string } }) {
    const result = await this.guardianService.remove(id, request.user.sub);
    return ResponseHelper.success(result, "Guardian deleted successfully");
  }
}
