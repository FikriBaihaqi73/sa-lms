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
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  CreateTeacherDto,
  UpdateTeacherDto,
} from "@repo/shared/schemas/teacher.schema";
import { Roles } from "../auth/roles.decorator";
import { TeachersService } from "./teachers.service";

@ApiTags("Teachers")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("teachers")
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new teacher" })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  @ApiOperation({ summary: "Retrieve teachers with search, filter, and pagination" })
  findAll(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("specialization") specialization?: string,
  ) {
    return this.teachersService.findAll(page ?? 1, limit ?? 10, search, status, specialization);
  }

  @Get("stats")
  @ApiOperation({ summary: "Retrieve teacher aggregate stats" })
  getStats() {
    return this.teachersService.getStats();
  }

  @Get(":id")
  @ApiOperation({ summary: "Retrieve a teacher by ID" })
  findById(@Param("id") id: string) {
    return this.teachersService.findById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a teacher" })
  update(@Param("id") id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a teacher" })
  delete(@Param("id") id: string) {
    return this.teachersService.delete(id);
  }
}
