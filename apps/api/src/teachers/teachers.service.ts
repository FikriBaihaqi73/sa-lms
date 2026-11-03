import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ResponseHelper } from "@repo/shared/http/response";
import { TeacherRepository } from "@repo/shared/infrastructure/repository/teacher.repository";
import type {
  CreateTeacherDto,
  UpdateTeacherDto,
} from "@repo/shared/schemas/teacher.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TeachersService {
  private readonly teachersRepository: TeacherRepository;

  constructor(private readonly prisma: PrismaService) {
    this.teachersRepository = new TeacherRepository(this.prisma.client);
  }

  private async institutionIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.client.profile.findFirst({
      where: { userId, deletedAt: null },
      select: { institutionId: true },
    });
    if (!profile)
      throw new ForbiddenException("Institution access is required");
    return profile.institutionId;
  }

  private async validateProfile(profileId: string, institutionId: string) {
    if (!profileId)
      throw new BadRequestException("Teacher profile is required");
    const profile = await this.prisma.client.profile.findFirst({
      where: { id: profileId, deletedAt: null },
      select: { id: true, institutionId: true },
    });
    if (!profile) throw new NotFoundException("Teacher profile not found");
    if (profile.institutionId !== institutionId)
      throw new ForbiddenException(
        "Teacher profile belongs to another institution",
      );
    const existing = await this.prisma.client.teachers.findFirst({
      where: { profile_id: profileId, deleted_at: null },
      select: { id: true },
    });
    if (existing)
      throw new ConflictException(
        "Teacher profile is already assigned to another teacher",
      );
  }

  private isPrismaError(error: unknown, code: string): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === code
    );
  }

  async create(createTeacherDto: CreateTeacherDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    await this.validateProfile(createTeacherDto.profile_id, institutionId);
    try {
      const teacher = await this.teachersRepository.create({
        profile_id: createTeacherDto.profile_id,
        teacher_number: createTeacherDto.teacher_number,
        ...(createTeacherDto.department_id
          ? { department_id: createTeacherDto.department_id }
          : {}),
        ...(createTeacherDto.specialization_id
          ? { specialization_id: createTeacherDto.specialization_id }
          : {}),
        ...(createTeacherDto.employment_status_id
          ? { employment_status_id: createTeacherDto.employment_status_id }
          : {}),
        ...(createTeacherDto.join_date
          ? { join_date: new Date(createTeacherDto.join_date) }
          : {}),
      });
      return ResponseHelper.success(teacher, "Teacher successfully created");
    } catch (error) {
      if (this.isPrismaError(error, "P2002"))
        throw new ConflictException(
          "Teacher profile or teacher number is already in use",
        );
      if (this.isPrismaError(error, "P2003"))
        throw new NotFoundException("Teacher profile not found");
      throw error;
    }
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
    employmentStatusId?: string,
    specializationId?: string,
  ) {
    const institutionId = await this.institutionIdFor(userId);
    const teachers = await this.teachersRepository.findAll({
      page,
      limit,
      ...(search !== undefined ? { search } : {}),
      ...(employmentStatusId !== undefined ? { employmentStatusId } : {}),
      ...(specializationId !== undefined ? { specializationId } : {}),
      institutionId,
    });
    return ResponseHelper.success(
      teachers.data,
      "Teachers successfully retrieved",
      200,
      teachers.meta,
    );
  }

  async getStats(userId: string) {
    const stats = await this.teachersRepository.getStats(
      await this.institutionIdFor(userId),
    );
    return ResponseHelper.success(
      stats,
      "Teacher stats successfully retrieved",
    );
  }

  async findById(id: string, userId: string) {
    const teacher = await this.teachersRepository.findByIdInInstitution(
      id,
      await this.institutionIdFor(userId),
    );
    if (!teacher) {
      throw new NotFoundException("Teacher not found");
    }
    return ResponseHelper.success(teacher, "Teacher successfully retrieved");
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    const existingTeacher = await this.teachersRepository.findByIdInInstitution(
      id,
      institutionId,
    );
    if (!existingTeacher) {
      throw new NotFoundException("Teacher not found");
    }
    if (
      updateTeacherDto.profile_id &&
      updateTeacherDto.profile_id !== existingTeacher.profile_id
    ) {
      await this.validateProfile(updateTeacherDto.profile_id, institutionId);
    }
    try {
      const teacher = await this.teachersRepository.update(id, {
        ...(updateTeacherDto.profile_id
          ? { profile_id: updateTeacherDto.profile_id }
          : {}),
        ...(updateTeacherDto.teacher_number
          ? { teacher_number: updateTeacherDto.teacher_number }
          : {}),
        ...(updateTeacherDto.department_id
          ? { department_id: updateTeacherDto.department_id }
          : {}),
        ...(updateTeacherDto.specialization_id
          ? { specialization_id: updateTeacherDto.specialization_id }
          : {}),
        ...(updateTeacherDto.employment_status_id
          ? { employment_status_id: updateTeacherDto.employment_status_id }
          : {}),
        ...(updateTeacherDto.join_date
          ? { join_date: new Date(updateTeacherDto.join_date) }
          : {}),
      });
      return ResponseHelper.success(teacher, "Teacher successfully updated");
    } catch (error) {
      if (this.isPrismaError(error, "P2002"))
        throw new ConflictException(
          "Teacher profile or teacher number is already in use",
        );
      if (this.isPrismaError(error, "P2003"))
        throw new NotFoundException("Teacher profile not found");
      throw error;
    }
  }

  async delete(id: string, userId: string) {
    const existingTeacher = await this.teachersRepository.findByIdInInstitution(
      id,
      await this.institutionIdFor(userId),
    );
    if (!existingTeacher) {
      throw new NotFoundException("Teacher not found");
    }
    const teacher = await this.teachersRepository.delete(id);
    return ResponseHelper.success(teacher, "Teacher successfully deleted");
  }
}
