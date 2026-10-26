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
  ClassQueryDto,
  CreateClassDto,
  UpdateClassDto,
} from "@repo/shared/schemas/class.schema";
import { ZodValidationPipe } from "nestjs-zod";
import type { Request } from "express";
import { Roles } from "../auth/roles.decorator";
import { ClassService } from "./class.service";

@ApiTags("Classes")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("classes")
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get()
  @ApiOperation({ summary: "Get all classes with pagination and search" })
  async findAll(
    @Query(new ZodValidationPipe()) query: ClassQueryDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const result = await this.classService.findAll(
      query.page ?? 1,
      query.limit ?? 10,
      query.search,
      request.user.sub,
    );

    return ResponseHelper.success(
      result.data,
      "Classes retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a class by ID" })
  async findOne(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return ResponseHelper.success(
      await this.classService.findOne(id, request.user.sub),
      "Class detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a class" })
  async create(
    @Body(new ZodValidationPipe()) dto: CreateClassDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return ResponseHelper.success(
      await this.classService.create(dto, request.user.sub),
      "Class created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a class" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateClassDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return ResponseHelper.success(
      await this.classService.update(id, dto, request.user.sub),
      "Class updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete a class" })
  async remove(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    return ResponseHelper.success(
      await this.classService.remove(id, request.user.sub),
      "Class deleted successfully",
    );
  }
}
