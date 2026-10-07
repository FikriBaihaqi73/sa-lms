import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import {
  CreateSemesterDto,
  FindAllSemesterDto,
  UpdateSemesterDto,
} from "@repo/shared/schemas/semester.schema";
import { SemesterService } from "./semester.service";

@ApiTags("Semester")
@Controller("semesters")
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post()
  @ApiOperation({ summary: "Create a new semester" })
  async create(@Body() createSemesterDto: CreateSemesterDto) {
    const data = await this.semesterService.create(createSemesterDto);
    return ResponseHelper.success(data, "Semester created successfully", 201);
  }

  @Get()
  @ApiOperation({ summary: "Get all semesters with pagination and search" })
  async findAll(@Query() query: FindAllSemesterDto) {
    const result = await this.semesterService.findAll(query);
    return ResponseHelper.success(
      result.data,
      "Semesters retrieved successfully",
      200,
      result.meta,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get semester by ID" })
  async findOne(@Param("id") id: string) {
    const data = await this.semesterService.findOne(id);
    return ResponseHelper.success(data, "Semester retrieved successfully");
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update semester by ID" })
  async update(
    @Param("id") id: string,
    @Body() updateSemesterDto: UpdateSemesterDto,
  ) {
    const data = await this.semesterService.update(id, updateSemesterDto);
    return ResponseHelper.success(data, "Semester updated successfully");
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete semester by ID" })
  async remove(@Param("id") id: string) {
    const data = await this.semesterService.remove(id);
    return ResponseHelper.success(data, "Semester deleted successfully");
  }
}
