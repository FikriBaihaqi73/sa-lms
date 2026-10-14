import { Injectable, NotFoundException } from "@nestjs/common";
import { ResponseHelper } from "@repo/shared/http/response";
import { StudentRepository } from "@repo/shared/infrastructure/repository/students.repository";
import type {
  CreateStudentDto,
  UpdateStudentDto,
} from "@repo/shared/schemas/student.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StudentService {
  private readonly studentRepository: StudentRepository;

  constructor(private readonly prisma: PrismaService) {
    this.studentRepository = new StudentRepository(this.prisma.client);
  }

  async create(createStudentDto: CreateStudentDto) {
    const student = await this.studentRepository.create({
      profileId: createStudentDto.profileId,
      ...(createStudentDto.departmentId !== undefined && {
        departmentId: createStudentDto.departmentId,
      }),
      academicStatusId: createStudentDto.academicStatusId,
      studentNumber: createStudentDto.studentNumber,
      ...(createStudentDto.enrollmentYear !== undefined && {
        enrollmentYear: createStudentDto.enrollmentYear,
      }),
      ...(createStudentDto.referralCode !== undefined && {
        referralCode: createStudentDto.referralCode,
      }),
      ...(createStudentDto.referralExpiresAt !== undefined && {
        referralExpiresAt: createStudentDto.referralExpiresAt,
      }),
    });

    return ResponseHelper.success(student, "Student successfully created");
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const students = await this.studentRepository.findAll({
      page,
      limit,
      ...(search !== undefined ? { search } : {}),
    });

    return ResponseHelper.success(students, "Students fetched successfully");
  }

  async findById(id: string) {
    const student = await this.studentRepository.findById(id);

    if (!student) {
      throw new NotFoundException("Student not found");
    }

    return ResponseHelper.success(student, "Student successfully retrieved");
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const existingStudent = await this.studentRepository.findById(id);

    if (!existingStudent) {
      throw new NotFoundException("Student not found");
    }

    const student = await this.studentRepository.update(id, {
      ...(updateStudentDto.departmentId !== undefined && {
        departmentId: updateStudentDto.departmentId,
      }),
      ...(updateStudentDto.academicStatusId !== undefined && {
        academicStatusId: updateStudentDto.academicStatusId,
      }),
      ...(updateStudentDto.studentNumber !== undefined && {
        studentNumber: updateStudentDto.studentNumber,
      }),
      ...(updateStudentDto.enrollmentYear !== undefined && {
        enrollmentYear: updateStudentDto.enrollmentYear,
      }),
      ...(updateStudentDto.referralCode !== undefined && {
        referralCode: updateStudentDto.referralCode,
      }),
      ...(updateStudentDto.referralExpiresAt !== undefined && {
        referralExpiresAt: updateStudentDto.referralExpiresAt,
      }),
    });

    return ResponseHelper.success(student, "Student successfully updated");
  }

  async delete(id: string) {
    const existingStudent = await this.studentRepository.findById(id);

    if (!existingStudent) {
      throw new NotFoundException("Student not found");
    }

    const student = await this.studentRepository.delete(id);

    return ResponseHelper.success(student, "Student successfully deleted");
  }
}
