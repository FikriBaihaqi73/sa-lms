import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import {
  ClassAnnouncementSearchDto,
  CreateClassAnnouncementDto,
  UpdateClassAnnouncementDto,
} from "@repo/shared/schemas/class-announcement.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { ClassAnnouncementsService } from "./class-announcements.service.js";

@ApiTags("Class Announcements")
@ApiBearerAuth("JWT-auth")
@Controller("class-announcements")
export class ClassAnnouncementsController {
  constructor(
    private readonly classAnnouncementsService: ClassAnnouncementsService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new class announcement" })
  async create(
    @Body(new ZodValidationPipe())
    createClassAnnouncementDto: CreateClassAnnouncementDto,
  ) {
    const result = await this.classAnnouncementsService.create(
      createClassAnnouncementDto,
    );
    return ResponseHelper.success(
      result,
      "Class Announcement created successfully",
      201,
    );
  }

  @Get()
  @ApiOperation({
    summary: "Get all class announcements with pagination and search",
  })
  async findAll(
    @Query(new ZodValidationPipe()) query: ClassAnnouncementSearchDto,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.classAnnouncementsService.findAll(
      query,
      page,
      limit,
    );
    return ResponseHelper.success(
      result.data,
      "Class Announcements fetched successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get class announcement by ID" })
  async findOne(@Param("id") id: string) {
    const result = await this.classAnnouncementsService.findById(id);
    return ResponseHelper.success(
      result,
      "Class Announcement fetched successfully",
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update class announcement by ID" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe())
    updateClassAnnouncementDto: UpdateClassAnnouncementDto,
  ) {
    const result = await this.classAnnouncementsService.update(
      id,
      updateClassAnnouncementDto,
    );
    return ResponseHelper.success(
      result,
      "Class Announcement updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete class announcement by ID" })
  async remove(@Param("id") id: string) {
    const result = await this.classAnnouncementsService.remove(id);
    return ResponseHelper.success(
      result,
      "Class Announcement deleted successfully",
    );
  }
}
