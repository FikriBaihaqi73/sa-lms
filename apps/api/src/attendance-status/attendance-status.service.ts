import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AttendanceStatusRepository } from "@repo/shared/infrastructure/repository/attendance-status.repository";
import type {
  CreateAttendanceStatusDto,
  UpdateAttendanceStatusDto,
} from "@repo/shared/schemas/attendance-status.schema";
import { PrismaService } from "../prisma/prisma.service";

function isPrismaCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

const duplicateMessage =
  "Attendance status name already exists in this institution";
const usageMessage = "Attendance status is still used by attendance records";

@Injectable()
export class AttendanceStatusService {
  private readonly attendanceStatusRepository: AttendanceStatusRepository;

  constructor(private readonly prisma: PrismaService) {
    this.attendanceStatusRepository = new AttendanceStatusRepository(
      this.prisma.client,
    );
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

  async findAll(
    page = 1,
    limit = 10,
    search: string | undefined,
    userId: string,
  ) {
    return this.attendanceStatusRepository.findAll(
      await this.institutionIdFor(userId),
      page,
      limit,
      search,
    );
  }

  async findOne(id: string, userId: string) {
    const attendanceStatus = await this.attendanceStatusRepository.findById(
      await this.institutionIdFor(userId),
      id,
    );
    if (!attendanceStatus) {
      throw new NotFoundException("Attendance status not found");
    }
    return attendanceStatus;
  }

  async create(dto: CreateAttendanceStatusDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    const existing = await this.attendanceStatusRepository.findByName(
      institutionId,
      dto.name,
    );
    if (existing) {
      throw new ConflictException(duplicateMessage);
    }
    try {
      return await this.attendanceStatusRepository.create(institutionId, {
        name: dto.name,
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
      });
    } catch (error) {
      if (isPrismaCode(error, "P2002")) {
        throw new ConflictException(duplicateMessage);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateAttendanceStatusDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    await this.findOne(id, userId);
    if (dto.name !== undefined) {
      const existing = await this.attendanceStatusRepository.findByName(
        institutionId,
        dto.name,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException(duplicateMessage);
      }
    }
    try {
      return await this.attendanceStatusRepository.update(institutionId, id, {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
      });
    } catch (error) {
      if (isPrismaCode(error, "P2002")) {
        throw new ConflictException(duplicateMessage);
      }
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    await this.findOne(id, userId);
    if (await this.attendanceStatusRepository.countUsage(institutionId, id)) {
      throw new ConflictException(usageMessage);
    }
    try {
      await this.attendanceStatusRepository.delete(institutionId, id);
      return { success: true, id };
    } catch (error) {
      if (isPrismaCode(error, "P2003")) {
        throw new ConflictException(usageMessage);
      }
      throw error;
    }
  }
}
