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
  CreateClassroomDto,
  UpdateClassroomDto,
} from "@repo/shared/schemas/classroom.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { ClassroomService } from "./classroom.service";
import type { Request } from "express";

@ApiTags("Classrooms")
@ApiBearerAuth("JWT-auth")
@Controller("classrooms")
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Get()
  @ApiOperation({ summary: "Get all classrooms with pagination and search" })
  async findAll(
    @Req() req: Request & { user: { sub: string } },
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("search") search?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const userId = req.user.sub;
    const result = await this.classroomService.findAll(
      userId,
      pageNumber,
      limitNumber,
      {
        search,
      },
    );

    return ResponseHelper.success(
      result.data,
      "Classrooms retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a classroom by ID" })
  async findOne(
    @Req() req: Request & { user: { sub: string } },
    @Param("id") id: string,
  ) {
    const userId = req.user.sub;
    const classroom = await this.classroomService.findOne(id, userId);
    return ResponseHelper.success(
      classroom,
      "Classroom detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a classroom" })
  async create(
    @Req() req: Request & { user: { sub: string } },
    @Body(new ZodValidationPipe()) dto: CreateClassroomDto,
  ) {
    const userId = req.user.sub;
    const classroom = await this.classroomService.create(userId, dto);
    return ResponseHelper.success(
      classroom,
      "Classroom created successfully",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a classroom" })
  async update(
    @Req() req: Request & { user: { sub: string } },
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateClassroomDto,
  ) {
    const userId = req.user.sub;
    const classroom = await this.classroomService.update(id, userId, dto);
    return ResponseHelper.success(classroom, "Classroom updated successfully");
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete a classroom" })
  async remove(
    @Req() req: Request & { user: { sub: string } },
    @Param("id") id: string,
  ) {
    const userId = req.user.sub;
    const result = await this.classroomService.remove(id, userId);
    return ResponseHelper.success(result, "Classroom deleted successfully");
  }
}
