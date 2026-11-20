import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
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
    (error as any).code === code
  );
}

const duplicateMessage = "Attendance status name already exists in this institution";
const usageMessage = "Attendance status is still used by attendance records";

@Injectable()
export class AttendanceStatusService {
  private readonly logger = new Logger(AttendanceStatusService.name);
  private readonly attendanceStatusRepository: AttendanceStatusRepository;

  constructor(private readonly prisma: PrismaService) {
    this.attendanceStatusRepository = new AttendanceStatusRepository(this.prisma.client);
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
  ): Promise<any> {
    if (page < 1) {
      throw new BadRequestException('Page must be >= 1');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    try {
      return this.attendanceStatusRepository.findAll(
        await this.institutionIdFor(userId),
        page,
        limit,
        search,
      );
    } catch (error) {
      this.logger.error('Unexpected error in findAll', error);
      throw new InternalServerErrorException('Failed to list attendance statuses');
    }
  }

  async findOne(id: string, userId: string): Promise<any> {
    try {
      const attendanceStatus = await this.attendanceStatusRepository.findById(
        await this.institutionIdFor(userId),
        id,
      );
      if (!attendanceStatus) {
        throw new NotFoundException('Attendance status not found');
      }
      return attendanceStatus;
    } catch (error) {
      this.logger.error('Unexpected error in findOne', error);
      throw new InternalServerErrorException('Failed to get attendance status');
    }
  }

  async create(dto: CreateAttendanceStatusDto, userId: string): Promise<any> {
    const institutionId = await this.institutionIdFor(userId);
    const existing = await this.attendanceStatusRepository.findByName(institutionId, dto.name);
    if (existing) {
      throw new ConflictException(duplicateMessage);
    }
    try {
      return await this.attendanceStatusRepository.create(institutionId, {
        name: dto.name,
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.icon !== undefined ? { icon: dto.icon } : {}),
      });
    } catch (error) {
      if (isPrismaCode(error, "P2002")) {
        throw new ConflictException(duplicateMessage);
      }
      this.logger.error('Unexpected error in create', error);
      throw new InternalServerErrorException('Failed to create attendance status');
    }
  }

  async update(id: string, dto: UpdateAttendanceStatusDto, userId: string): Promise<any> {
    const institutionId = await this.institutionIdFor(userId);
    await this.findOne(id, userId);
    if (dto.name !== undefined) {
      const existing = await this.attendanceStatusRepository.findByName(institutionId, dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException(duplicateMessage);
      }
    }
    try {
      return await this.attendanceStatusRepository.update(institutionId, id, {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.icon !== undefined ? { icon: dto.icon } : {}),
      });
    } catch (error) {
      if (isPrismaCode(error, "P2002")) {
        throw new ConflictException(duplicateMessage);
      }
      this.logger.error('Unexpected error in update', error);
      throw new InternalServerErrorException('Failed to update attendance status');
    }
  }

  async remove(id: string, userId: string): Promise<{ success: true; id: string }> {
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
      this.logger.error('Unexpected error in remove', error);
      throw new InternalServerErrorException('Failed to delete attendance status');
    }
  }
}
