import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ResponseHelper } from "@repo/shared/http/response";
import { ClassStudentRepository } from "@repo/shared/infrastructure/repository/class-student.repository";
import type {
  CreateClassStudentDto,
  UpdateClassStudentDto,
} from "@repo/shared/schemas/class-student.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ClassStudentService {
  private readonly classStudentRepository: ClassStudentRepository;

  constructor(private readonly prisma: PrismaService) {
    this.classStudentRepository = new ClassStudentRepository(
      this.prisma.client,
    );
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    classId?: string,
    status?: string,
  ) {
    const classStudents = await this.classStudentRepository.findAll({
      page,
      limit,
      ...(search !== undefined ? { search } : {}),
      ...(classId ? { classId } : {}),
      ...(status !== undefined ? { status } : {}),
    });

    return ResponseHelper.success(
      classStudents,
      "Class students retrieved successfully",
    );
  }

  async findOne(id: string) {
    const classStudent = await this.classStudentRepository.findById(id);
    if (!classStudent) {
      throw new NotFoundException("Class student not found");
    }
    return classStudent;
  }

  async getSummary(classId?: string) {
    return this.classStudentRepository.getSummary(classId);
  }

  async create(dto: CreateClassStudentDto) {
    const existing = await this.classStudentRepository.findByClassAndStudent(
      dto.classId,
      dto.studentId,
    );
    if (existing) {
      throw new ConflictException("Student is already assigned to this class");
    }
    return this.classStudentRepository.create(dto);
  }

  async update(id: string, dto: UpdateClassStudentDto) {
    const current = await this.findOne(id);

    if (dto.classId !== undefined || dto.studentId !== undefined) {
      const existing = await this.classStudentRepository.findByClassAndStudent(
        dto.classId ?? current.classId,
        dto.studentId ?? current.studentId,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException(
          "Student is already assigned to this class",
        );
      }
    }

    return this.classStudentRepository.update(id, {
      ...(dto.classId !== undefined ? { classId: dto.classId } : {}),
      ...(dto.studentId !== undefined ? { studentId: dto.studentId } : {}),
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.classStudentRepository.delete(id);
    return { success: true, id };
  }

  async restore(id: string) {
    const classStudent = await this.classStudentRepository.findById(id);
    if (!classStudent) {
      throw new NotFoundException("Class student not found");
    }
    return this.classStudentRepository.restore(id);
  }
}
