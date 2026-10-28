import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import {
  CreateSubjectDto,
  SubjectQueryDto,
  UpdateSubjectDto,
} from "@repo/shared/schemas/subject.schema";
import { ZodValidationPipe } from "nestjs-zod";
import type { Request } from "express";
import { Roles } from "../auth/roles.decorator";
import { SubjectService } from "./subject.service";

@ApiTags("Subjects")
@Roles("admin")
@Controller("subjects")
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @ApiOperation({ summary: "Create a new subject" })
  async create(
    @Body(new ZodValidationPipe()) createSubjectDto: CreateSubjectDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const data = await this.subjectService.create(createSubjectDto, request.user.sub);
    return ResponseHelper.success({
      message: "Subject created successfully",
      data,
      code: HttpStatus.CREATED,
    });
  }

  @Get()
  @ApiOperation({
    summary: "Get a list of subjects with pagination and search",
  })
  async findAll(
    @Query(new ZodValidationPipe()) query: SubjectQueryDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const result = await this.subjectService.findAll(query, request.user.sub);
    return ResponseHelper.success({
      message: "Subjects retrieved successfully",
      data: result,
      code: HttpStatus.OK,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a subject by ID" })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const data = await this.subjectService.findOne(id, request.user.sub);
    return ResponseHelper.success({
      message: "Subject retrieved successfully",
      data,
      code: HttpStatus.OK,
    });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a subject by ID" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe()) updateSubjectDto: UpdateSubjectDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const data = await this.subjectService.update(id, updateSubjectDto, request.user.sub);
    return ResponseHelper.success({
      message: "Subject updated successfully",
      data,
      code: HttpStatus.OK,
    });
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a subject by ID" })
  async remove(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    await this.subjectService.remove(id, request.user.sub);
    return ResponseHelper.success({
      message: "Subject deleted successfully",
      data: null,
      code: HttpStatus.OK,
    });
  }
}
