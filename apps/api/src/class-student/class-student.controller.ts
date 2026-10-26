import {
  Body,
  Controller,
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
  CreateClassStudentDto,
  UpdateClassStudentDto,
} from "@repo/shared/schemas/class-student.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { ClassStudentService } from "./class-student.service";

@ApiTags("Class Students")
@ApiBearerAuth("JWT-auth")
@Controller("class-students")
export class ClassStudentController {
  constructor(private readonly classStudentService: ClassStudentService) {}

  @Get()
  @ApiOperation({ summary: "Get class students with search and pagination" })
  async findAll(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
    @Query("search") search?: string,
    @Query("classId") classId?: string,
    @Query("status") status?: string,
  ) {
    const classStudents = await this.classStudentService.findAll(
      page,
      limit,
      search,
      classId,
      status,
    );
    return ResponseHelper.success(
      classStudents,
      "Class students retrieved successfully",
    );
  }

  /**
   * PENTING: Route statis harus dideklarasikan SEBELUM route dinamis (:id)
   * agar NestJS tidak salah menangkap string "summary" sebagai UUID parameter.
   */
  @Get("summary")
  @ApiOperation({
    summary: "Get class students summary statistics (4 stat cards)",
  })
  async getSummary(@Query("classId") classId?: string) {
    const summary = await this.classStudentService.getSummary(classId);
    return ResponseHelper.success(summary, "Summary retrieved successfully");
  }

  @Get(":id")
  @ApiOperation({ summary: "Get class student by ID" })
  async findOne(@Param("id") id: string) {
    const classStudent = await this.classStudentService.findOne(id);
    return ResponseHelper.success(
      classStudent,
      "Class student retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Assign a student to a class" })
  async create(@Body(new ZodValidationPipe()) dto: CreateClassStudentDto) {
    const classStudent = await this.classStudentService.create(dto);
    return ResponseHelper.success(
      classStudent,
      "Student assigned to class successfully",
      201,
    );
  }

  @Post("batch")
  @ApiOperation({ summary: "Assign multiple students to a class at once" })
  async createBatch(
    @Body() body: { classId: string; studentIds: string[] },
  ) {
    const results = await Promise.all(
      body.studentIds.map((studentId) =>
        this.classStudentService.create({
          classId: body.classId,
          studentId,
        }),
      ),
    );
    return ResponseHelper.success(
      { count: results.length },
      "Students assigned to class successfully",
      201,
    );
  }

  @Post(":id/restore")
  @ApiOperation({ summary: "Restore a previously removed student to a class" })
  async restore(@Param("id") id: string) {
    const classStudent = await this.classStudentService.restore(id);
    return ResponseHelper.success(
      classStudent,
      "Student restored to class successfully",
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a class student assignment" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateClassStudentDto,
  ) {
    const classStudent = await this.classStudentService.update(id, dto);
    return ResponseHelper.success(
      classStudent,
      "Class student updated successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remove a student from a class" })
  async remove(@Param("id") id: string) {
    const result = await this.classStudentService.remove(id);
    return ResponseHelper.success(
      result,
      "Student removed from class successfully",
    );
  }
}
