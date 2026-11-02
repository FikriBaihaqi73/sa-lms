import { Injectable, NotFoundException } from "@nestjs/common";
import {
  ScheduleRepository,
  type ScheduleSearchInput,
} from "@repo/shared/infrastructure/repository/schedule.repository";
import type {
  CreateScheduleDto,
  UpdateScheduleDto,
} from "@repo/shared/schemas/schedule.schema";
import { PrismaService } from "../prisma/prisma.service";

function parseTimeString(
  timeStr: string | null | undefined,
): Date | null | undefined {
  if (timeStr === undefined) return undefined;
  if (timeStr === null || timeStr.trim() === "") return null;
  const trimmed = timeStr.trim();
  if (/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(trimmed)) {
    const parts = trimmed.split(":");
    const hours = (parts[0] ?? "00").padStart(2, "0");
    const minutes = (parts[1] ?? "00").padStart(2, "0");
    const seconds = (parts[2] ?? "00").padStart(2, "0");
    return new Date(`1970-01-01T${hours}:${minutes}:${seconds}.000Z`);
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

@Injectable()
export class ScheduleService {
  private readonly scheduleRepository: ScheduleRepository;

  constructor(private readonly prisma: PrismaService) {
    this.scheduleRepository = new ScheduleRepository(this.prisma.client);
  }

  async findAll(page: number, limit: number, filters?: ScheduleSearchInput) {
    return this.scheduleRepository.findAll(page, limit, filters);
  }

  async findOne(id: string) {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) throw new NotFoundException("Schedule not found");
    return schedule;
  }

  async create(dto: CreateScheduleDto) {
    const startTime = parseTimeString(dto.startTime);
    const endTime = parseTimeString(dto.endTime);
    return this.scheduleRepository.create({
      classSubjectId: dto.classSubjectId,
      classroomId: dto.classroomId,
      day: dto.day,
      ...(startTime !== undefined ? { startTime } : {}),
      ...(endTime !== undefined ? { endTime } : {}),
    });
  }

  async update(id: string, dto: UpdateScheduleDto) {
    await this.findOne(id);
    const startTime = parseTimeString(dto.startTime);
    const endTime = parseTimeString(dto.endTime);
    return this.scheduleRepository.update(id, {
      ...(dto.classSubjectId !== undefined
        ? { classSubjectId: dto.classSubjectId }
        : {}),
      ...(dto.classroomId !== undefined
        ? { classroomId: dto.classroomId }
        : {}),
      ...(dto.day !== undefined ? { day: dto.day } : {}),
      ...(startTime !== undefined ? { startTime } : {}),
      ...(endTime !== undefined ? { endTime } : {}),
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.scheduleRepository.delete(id);
    return { success: true, id };
  }
}
