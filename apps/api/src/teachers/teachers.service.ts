import { Injectable, NotFoundException } from "@nestjs/common";
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

  async create(createTeacherDto: CreateTeacherDto) {
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
  }

  async findAll(page = 1, limit = 10, search?: string, employmentStatusId?: string, specializationId?: string) {
    const teachers = await this.teachersRepository.findAll({
      page,
      limit,
      ...(search !== undefined ? { search } : {}),
      ...(employmentStatusId !== undefined ? { employmentStatusId } : {}),
      ...(specializationId !== undefined ? { specializationId } : {}),
    });
    return ResponseHelper.success(teachers.data, "Teachers successfully retrieved", 200, teachers.meta);
  }

  async getStats() {
    const stats = await this.teachersRepository.getStats();
    return ResponseHelper.success(stats, "Teacher stats successfully retrieved");
  }

  async findById(id: string) {
    const teacher = await this.teachersRepository.findById(id);
    if (!teacher) {
      throw new NotFoundException("Teacher not found");
    }
    return ResponseHelper.success(teacher, "Teacher successfully retrieved");
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    const existingTeacher = await this.teachersRepository.findById(id);
    if (!existingTeacher) {
      throw new NotFoundException("Teacher not found");
    }
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
  }

  async delete(id: string) {
    const existingTeacher = await this.teachersRepository.findById(id);
    if (!existingTeacher) {
      throw new NotFoundException("Teacher not found");
    }
    const teacher = await this.teachersRepository.delete(id);
    return ResponseHelper.success(teacher, "Teacher successfully deleted");
  }
}
