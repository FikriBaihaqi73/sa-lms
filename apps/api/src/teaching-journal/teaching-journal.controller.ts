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
  CreateTeachingJournalDto,
  UpdateTeachingJournalDto,
} from "@repo/shared/schemas/teaching-journal.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { TeachingJournalService } from "./teaching-journal.service";

@ApiTags("Teaching Journals")
@ApiBearerAuth("JWT-auth")
@Roles("admin", "teacher")
@Controller("teaching-journals")
export class TeachingJournalController {
  constructor(
    private readonly teachingJournalService: TeachingJournalService,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Get all teaching journals with pagination, search and filters",
  })
  async findAll(
    @Req() request: Request & { user: { sub: string } },
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("search") search?: string,
    @Query("schedule_id") schedule_id?: string,
    @Query("journal_date") journal_date?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    const result = await this.teachingJournalService.findAll(
      pageNumber,
      limitNumber,
      {
        search,
        schedule_id,
        journal_date,
      },
      request.user.sub,
    );
    return ResponseHelper.success(
      result.data,
      "Teaching journals retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a teaching journal by ID" })
  async findOne(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const journal = await this.teachingJournalService.findOne(
      id,
      request.user.sub,
    );
    return ResponseHelper.success(
      journal,
      "Teaching journal detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a teaching journal" })
  async create(
    @Body(new ZodValidationPipe()) dto: CreateTeachingJournalDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const journal = await this.teachingJournalService.create(
      dto,
      request.user.sub,
    );
    return ResponseHelper.success(
      journal,
      "Teaching journal created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a teaching journal" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateTeachingJournalDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const journal = await this.teachingJournalService.update(
      id,
      dto,
      request.user.sub,
    );
    return ResponseHelper.success(
      journal,
      "Teaching journal updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete a teaching journal" })
  async remove(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const result = await this.teachingJournalService.remove(
      id,
      request.user.sub,
    );
    return ResponseHelper.success(
      result,
      "Teaching journal deleted successfully",
    );
  }
}
