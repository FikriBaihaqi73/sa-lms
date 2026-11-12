import {
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
import { teacherSelect } from "@repo/shared/selects/teacher.select";
import * as bcrypt from "bcrypt";
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
    if (!profile?.institutionId) {
      throw new ForbiddenException("Institution access is required");
    }
    return profile.institutionId;
  }

  private isPrismaError(error: unknown, code: string): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === code
    );
  }

  /**
   * 1-Step Onboarding Teacher:
   * Buat Akun Login (Users) + Profil (Profile) + Data Kepegawaian (Teachers) sekaligus
   * dalam satu transaksi database Prisma yang atomik.
   */
  async create(createTeacherDto: CreateTeacherDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);

    // 1. Validasi keunikan NIP
    const trimmedNip = createTeacherDto.teacher_number.trim();
    const existingNip = await this.prisma.client.teachers.findFirst({
      where: {
        teacher_number: trimmedNip,
        deleted_at: null,
      },
      select: { id: true },
    });
    if (existingNip) {
      throw new ConflictException("NIP / Nomor Induk Pengajar sudah digunakan");
    }

    // 2. Validasi keunikan Email akun login
    const emailLower = createTeacherDto.email.trim().toLowerCase();
    const existingEmail = await this.prisma.client.users.findUnique({
      where: { email: emailLower },
      select: { id: true },
    });
    if (existingEmail) {
      throw new ConflictException("Email sudah digunakan untuk akun lain");
    }

    // 3. Ambil role 'teacher'
    const teacherRole = await this.prisma.client.role.findFirst({
      where: {
        name: { equals: "teacher", mode: "insensitive" },
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!teacherRole) {
      throw new NotFoundException("Role 'teacher' tidak ditemukan di sistem");
    }

    // 4. Validasi Foreign Keys jika disediakan
    if (createTeacherDto.department_id) {
      const dept = await this.prisma.client.departments.findFirst({
        where: {
          id: createTeacherDto.department_id,
          institution_id: institutionId,
          deleted_at: null,
        },
        select: { id: true },
      });
      if (!dept) {
        throw new NotFoundException(
          "Departemen tidak ditemukan pada institusi ini",
        );
      }
    }
    if (createTeacherDto.specialization_id) {
      const spec = await this.prisma.client.specializations.findFirst({
        where: {
          id: createTeacherDto.specialization_id,
          deleted_at: null,
        },
        select: { id: true },
      });
      if (!spec) {
        throw new NotFoundException("Spesialisasi tidak ditemukan");
      }
    }
    if (createTeacherDto.employment_status_id) {
      const empStatus = await this.prisma.client.employmentStatus.findFirst({
        where: {
          id: createTeacherDto.employment_status_id,
          deletedAt: null,
        },
        select: { id: true },
      });
      if (!empStatus) {
        throw new NotFoundException("Status kepegawaian tidak ditemukan");
      }
    }

    // 5. Hash password awal
    const hashedPassword = await bcrypt.hash(createTeacherDto.password, 10);

    try {
      const teacher = await this.prisma.client.$transaction(async (tx) => {
        // Step A: Buat Users
        const user = await tx.users.create({
          data: {
            email: emailLower,
            password: hashedPassword,
            is_active: true,
          },
        });

        // Step B: Buat Profile yang terhubung ke Users dan Institution
        const profile = await tx.profile.create({
          data: {
            userId: user.id,
            institutionId,
            roleId: teacherRole.id,
            fullName: createTeacherDto.full_name.trim(),
            email: emailLower,
            phoneNumber: createTeacherDto.phone?.trim() || null,
            gender: createTeacherDto.gender?.trim() || null,
          },
        });

        // Step C: Buat Teachers yang terhubung ke Profile
        return tx.teachers.create({
          data: {
            profile_id: profile.id,
            teacher_number: trimmedNip,
            department_id: createTeacherDto.department_id || null,
            specialization_id: createTeacherDto.specialization_id || null,
            employment_status_id: createTeacherDto.employment_status_id || null,
            join_date: createTeacherDto.join_date
              ? new Date(createTeacherDto.join_date)
              : null,
          },
          select: teacherSelect,
        });
      });

      return ResponseHelper.success(
        teacher,
        "Teacher successfully created",
        201,
      );
    } catch (error) {
      if (this.isPrismaError(error, "P2002")) {
        throw new ConflictException(
          "NIP atau Email guru sudah terdaftar di sistem",
        );
      }
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
    const institutionId = await this.institutionIdFor(userId);
    const stats = await this.teachersRepository.getStats(institutionId);
    return ResponseHelper.success(
      stats,
      "Teacher stats successfully retrieved",
    );
  }

  async findById(id: string, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    const teacher = await this.teachersRepository.findByIdInInstitution(
      id,
      institutionId,
    );
    if (!teacher) {
      throw new NotFoundException("Teacher not found");
    }
    return ResponseHelper.success(teacher, "Teacher successfully retrieved");
  }

  /**
   * Edit Data Guru:
   * Memperbarui data Teachers sekaligus data Profile (full_name, gender, phone)
   * dan Users (email, serta password jika diisi) dalam transaksi database.
   */
  async update(id: string, updateTeacherDto: UpdateTeacherDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    const existingTeacher = await this.prisma.client.teachers.findFirst({
      where: {
        id,
        deleted_at: null,
        profile: { institutionId },
      },
      include: {
        profile: {
          include: {
            users: true,
          },
        },
      },
    });
    if (!existingTeacher) {
      throw new NotFoundException("Teacher not found");
    }

    // 1. Cek keunikan NIP jika diubah
    if (
      updateTeacherDto.teacher_number &&
      updateTeacherDto.teacher_number.trim() !== existingTeacher.teacher_number
    ) {
      const duplicateNip = await this.prisma.client.teachers.findFirst({
        where: {
          teacher_number: updateTeacherDto.teacher_number.trim(),
          id: { not: id },
          deleted_at: null,
        },
        select: { id: true },
      });
      if (duplicateNip) {
        throw new ConflictException(
          "NIP / Nomor Induk Pengajar sudah digunakan",
        );
      }
    }

    // 2. Cek keunikan Email jika diubah
    if (updateTeacherDto.email) {
      const emailLower = updateTeacherDto.email.trim().toLowerCase();
      const currentEmail = existingTeacher.profile?.users?.email?.toLowerCase();
      if (emailLower !== currentEmail) {
        const duplicateEmail = await this.prisma.client.users.findFirst({
          where: {
            email: emailLower,
            ...(existingTeacher.profile?.userId
              ? { id: { not: existingTeacher.profile.userId } }
              : {}),
            deleted_at: null,
          },
          select: { id: true },
        });
        if (duplicateEmail) {
          throw new ConflictException("Email sudah digunakan untuk akun lain");
        }
      }
    }

    // 3. Validasi foreign keys jika diubah
    if (updateTeacherDto.department_id) {
      const dept = await this.prisma.client.departments.findFirst({
        where: {
          id: updateTeacherDto.department_id,
          institution_id: institutionId,
          deleted_at: null,
        },
        select: { id: true },
      });
      if (!dept) {
        throw new NotFoundException(
          "Departemen tidak ditemukan pada institusi ini",
        );
      }
    }
    if (updateTeacherDto.specialization_id) {
      const spec = await this.prisma.client.specializations.findFirst({
        where: {
          id: updateTeacherDto.specialization_id,
          deleted_at: null,
        },
        select: { id: true },
      });
      if (!spec) {
        throw new NotFoundException("Spesialisasi tidak ditemukan");
      }
    }
    if (updateTeacherDto.employment_status_id) {
      const empStatus = await this.prisma.client.employmentStatus.findFirst({
        where: {
          id: updateTeacherDto.employment_status_id,
          deletedAt: null,
        },
        select: { id: true },
      });
      if (!empStatus) {
        throw new NotFoundException("Status kepegawaian tidak ditemukan");
      }
    }

    // 4. Hash password baru jika diisi
    const newPassword = updateTeacherDto.password?.trim();
    const hashedPassword =
      newPassword && newPassword.length >= 8
        ? await bcrypt.hash(newPassword, 10)
        : undefined;

    try {
      const teacher = await this.prisma.client.$transaction(async (tx) => {
        // Step A: Update Users
        if (existingTeacher.profile?.userId) {
          const userUpdates: { email?: string; password?: string } = {};
          if (updateTeacherDto.email) {
            userUpdates.email = updateTeacherDto.email.trim().toLowerCase();
          }
          if (hashedPassword) {
            userUpdates.password = hashedPassword;
          }
          if (Object.keys(userUpdates).length > 0) {
            await tx.users.update({
              where: { id: existingTeacher.profile.userId },
              data: userUpdates,
            });
          }
        }

        // Step B: Update Profile
        if (existingTeacher.profile_id) {
          const profileUpdates: {
            fullName?: string;
            email?: string;
            phoneNumber?: string | null;
            gender?: string | null;
          } = {};
          if (updateTeacherDto.full_name !== undefined) {
            profileUpdates.fullName = updateTeacherDto.full_name.trim();
          }
          if (updateTeacherDto.email !== undefined) {
            profileUpdates.email = updateTeacherDto.email.trim().toLowerCase();
          }
          if (updateTeacherDto.phone !== undefined) {
            profileUpdates.phoneNumber = updateTeacherDto.phone?.trim() || null;
          }
          if (updateTeacherDto.gender !== undefined) {
            profileUpdates.gender = updateTeacherDto.gender?.trim() || null;
          }
          if (Object.keys(profileUpdates).length > 0) {
            await tx.profile.update({
              where: { id: existingTeacher.profile_id },
              data: profileUpdates,
            });
          }
        }

        // Step C: Update Teachers
        const teacherUpdates: {
          teacher_number?: string;
          department_id?: string | null;
          specialization_id?: string | null;
          employment_status_id?: string | null;
          join_date?: Date | null;
        } = {};
        if (updateTeacherDto.teacher_number !== undefined) {
          teacherUpdates.teacher_number =
            updateTeacherDto.teacher_number.trim();
        }
        if (updateTeacherDto.department_id !== undefined) {
          teacherUpdates.department_id = updateTeacherDto.department_id || null;
        }
        if (updateTeacherDto.specialization_id !== undefined) {
          teacherUpdates.specialization_id =
            updateTeacherDto.specialization_id || null;
        }
        if (updateTeacherDto.employment_status_id !== undefined) {
          teacherUpdates.employment_status_id =
            updateTeacherDto.employment_status_id || null;
        }
        if (updateTeacherDto.join_date !== undefined) {
          teacherUpdates.join_date = updateTeacherDto.join_date
            ? new Date(updateTeacherDto.join_date)
            : null;
        }

        return tx.teachers.update({
          where: { id },
          data: teacherUpdates,
          select: teacherSelect,
        });
      });

      return ResponseHelper.success(teacher, "Teacher successfully updated");
    } catch (error) {
      if (this.isPrismaError(error, "P2002")) {
        throw new ConflictException("NIP atau Email sudah digunakan");
      }
      throw error;
    }
  }

  async delete(id: string, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    const existingTeacher = await this.teachersRepository.findByIdInInstitution(
      id,
      institutionId,
    );
    if (!existingTeacher) {
      throw new NotFoundException("Teacher not found");
    }

    const now = new Date();
    const profileId = existingTeacher.profile_id;
    const targetUserId = existingTeacher.profile?.userId;

    const teacher = await this.prisma.client.$transaction(async (tx) => {
      // 1. Soft-delete data guru
      const deletedTeacher = await tx.teachers.update({
        where: { id },
        data: { deleted_at: now },
        select: teacherSelect,
      });

      // 2. Soft-delete data profil yang terhubung ke guru ini
      if (profileId) {
        await tx.profile.updateMany({
          where: { id: profileId, deletedAt: null },
          data: { deletedAt: now },
        });
      }

      // 3. Soft-delete akun user agar ikut terhapus di halaman data pengguna
      if (targetUserId) {
        await tx.users.updateMany({
          where: { id: targetUserId, deleted_at: null },
          data: { deleted_at: now, is_active: false },
        });
      }

      return deletedTeacher;
    });

    return ResponseHelper.success(teacher, "Teacher successfully deleted");
  }
}
