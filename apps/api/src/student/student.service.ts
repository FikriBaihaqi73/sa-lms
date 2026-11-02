import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
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

  /**
   * Resolve the institution scope from the authenticated user's profile.
   * The institution is never taken from the request body so a caller
   * cannot read or mutate another institution's students.
   */
  private async institutionIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.client.profile.findFirst({
      where: { userId, deletedAt: null },
      select: { institutionId: true },
    });
    if (!profile?.institutionId) {
      throw new ForbiddenException("Institution access is required");
    }
    return profile.institutionId;
  }

  async create(createStudentDto: CreateStudentDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);

    // ---- NEW VALIDATIONS ----
    // 1. profileId must be provided for admin creation
    if (!createStudentDto.profileId) {
      throw new BadRequestException(
        "profileId is required when creating a student",
      );
    }

    // 2. Verify the profile belongs to the admin's institution
    const profileCheck = await this.prisma.client.profile.findFirst({
      where: {
        id: createStudentDto.profileId,
        institutionId,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!profileCheck) {
      throw new ForbiddenException(
        "Profil tidak termasuk dalam institusi Anda",
      );
    }

    // 3. If departmentId is supplied, ensure it belongs to the same institution
    if (createStudentDto.departmentId) {
      const dept = await this.prisma.client.departments.findFirst({
        where: {
          id: createStudentDto.departmentId,
          institution_id: institutionId,
          deleted_at: null,
        },
        select: { id: true },
      });
      if (!dept) {
        throw new ForbiddenException(
          "Department does not belong to your institution",
        );
      }
    }
    // ---- END NEW VALIDATIONS ----
    if (createStudentDto.profileId) {
      const existingByProfile = await this.studentRepository.findByProfileId(
        createStudentDto.profileId,
      );
      if (existingByProfile) {
        throw new ConflictException(
          "Profil pengguna ini sudah terdaftar sebagai siswa",
        );
      }

      // Verify the profile belongs to the caller's institution
      const profile = await this.prisma.client.profile.findFirst({
        where: {
          id: createStudentDto.profileId,
          deletedAt: null,
        },
        select: { institutionId: true },
      });
      if (!profile || profile.institutionId !== institutionId) {
        throw new ForbiddenException(
          "Profil tidak termasuk dalam institusi Anda",
        );
      }
    }

    const existingByNumber = await this.studentRepository.findByStudentNumber(
      createStudentDto.studentNumber,
    );
    if (existingByNumber) {
      throw new ConflictException("Nomor Induk Siswa sudah terdaftar");
    }

    const student = await this.studentRepository.create({
      ...(createStudentDto.profileId
        ? { profileId: createStudentDto.profileId }
        : {}),
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

  async findAll(userId: string, page = 1, limit = 10, search?: string) {
    const institutionId = await this.institutionIdFor(userId);

    const students = await this.studentRepository.findAll({
      page,
      limit,
      institutionId,
      ...(search !== undefined ? { search } : {}),
    });

    return ResponseHelper.success(students, "Students fetched successfully");
  }

  async findById(userId: string, id: string) {
    const institutionId = await this.institutionIdFor(userId);

    const student = await this.studentRepository.findById(id, institutionId);

    if (!student) {
      throw new NotFoundException("Student not found");
    }

    return ResponseHelper.success(student, "Student successfully retrieved");
  }

  async update(userId: string, id: string, updateStudentDto: UpdateStudentDto) {
    const institutionId = await this.institutionIdFor(userId);

    const existingStudent = await this.studentRepository.findById(
      id,
      institutionId,
    );

    if (!existingStudent) {
      throw new NotFoundException("Student not found");
    }

    // ---- VALIDATE DEPARTMENT ON UPDATE ----
    if (updateStudentDto.departmentId) {
      const dept = await this.prisma.client.departments.findFirst({
        where: {
          id: updateStudentDto.departmentId,
          institution_id: institutionId,
          deleted_at: null,
        },
        select: { id: true },
      });
      if (!dept) {
        throw new ForbiddenException(
          "Department does not belong to your institution",
        );
      }
    }
    // ---- END VALIDATE DEPARTMENT ----
    const student = await this.studentRepository.update(
      id,
      {
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
      },
      institutionId,
    );

    return ResponseHelper.success(student, "Student successfully updated");
  }

  async delete(userId: string, id: string) {
    const institutionId = await this.institutionIdFor(userId);

    const existingStudent = await this.studentRepository.findById(
      id,
      institutionId,
    );

    if (!existingStudent) {
      throw new NotFoundException("Student not found");
    }

    const student = await this.studentRepository.delete(id, institutionId);

    return ResponseHelper.success(student, "Student successfully deleted");
  }
}
