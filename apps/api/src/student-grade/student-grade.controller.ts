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
  CreateStudentGradeDto,
  StudentGradeQueryDto,
  UpdateStudentGradeDto,
} from "@repo/shared/schemas/student-grade.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { StudentGradeService } from "./student-grade.service";

type AuthenticatedRequest = Request & { user: { sub: string } };

@ApiTags("Student Grades")
@ApiBearerAuth("JWT-auth")
@Roles("admin")
@Controller("student-grades")
export class StudentGradeController {
  constructor(private readonly studentGradeService: StudentGradeService) {}

  @Get()
  @ApiOperation({
    summary: "Menampilkan daftar nilai siswa dengan filter dan pagination",
  })
  async findAll(
    @Req() request: AuthenticatedRequest,
    @Query(new ZodValidationPipe()) query: StudentGradeQueryDto,
  ) {
    const result = await this.studentGradeService.findAll(query, request.user);
    return ResponseHelper.success(
      result.data,
      "Daftar nilai siswa berhasil dimuat.",
      200,
      result.meta,
    );
  }

  @Get("stats")
  @ApiOperation({ summary: "Menampilkan statistik nilai siswa" })
  async stats(@Req() request: AuthenticatedRequest) {
    return ResponseHelper.success(
      await this.studentGradeService.stats(request.user),
      "Statistik nilai siswa berhasil dimuat.",
    );
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Menampilkan nilai siswa berdasarkan ID siswa" })
  async findByStudentId(
    @Req() request: AuthenticatedRequest,
    @Param("studentId") studentId: string,
  ) {
    return ResponseHelper.success(
      await this.studentGradeService.findByStudentId(studentId, request.user),
      "Nilai siswa berhasil dimuat.",
    );
  }

  @Get("class-subject/:classSubjectId")
  @ApiOperation({
    summary: "Menampilkan nilai berdasarkan mata pelajaran kelas",
  })
  async findByClassSubjectId(
    @Req() request: AuthenticatedRequest,
    @Param("classSubjectId") classSubjectId: string,
  ) {
    return ResponseHelper.success(
      await this.studentGradeService.findByClassSubjectId(
        classSubjectId,
        request.user,
      ),
      "Nilai mata pelajaran kelas berhasil dimuat.",
    );
  }

  @Get("academic-year/:academicYearId")
  @ApiOperation({ summary: "Menampilkan nilai berdasarkan tahun ajaran" })
  async findByAcademicYearId(
    @Req() request: AuthenticatedRequest,
    @Param("academicYearId") academicYearId: string,
  ) {
    return ResponseHelper.success(
      await this.studentGradeService.findByAcademicYearId(
        academicYearId,
        request.user,
      ),
      "Nilai tahun ajaran berhasil dimuat.",
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Menampilkan detail nilai siswa" })
  async findOne(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return ResponseHelper.success(
      await this.studentGradeService.findOne(id, request.user),
      "Detail nilai siswa berhasil dimuat.",
    );
  }

  @Post()
  @ApiOperation({ summary: "Menambahkan nilai siswa" })
  async create(
    @Req() request: AuthenticatedRequest,
    @Body(new ZodValidationPipe()) dto: CreateStudentGradeDto,
  ) {
    return ResponseHelper.success(
      await this.studentGradeService.create(dto, request.user),
      "Nilai siswa berhasil ditambahkan.",
      201,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Memperbarui nilai siswa" })
  async update(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateStudentGradeDto,
  ) {
    return ResponseHelper.success(
      await this.studentGradeService.update(id, dto, request.user),
      "Nilai siswa berhasil diperbarui.",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Menghapus nilai siswa secara soft delete" })
  async remove(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return ResponseHelper.success(
      await this.studentGradeService.remove(id, request.user),
      "Nilai siswa berhasil dihapus.",
    );
  }
}
