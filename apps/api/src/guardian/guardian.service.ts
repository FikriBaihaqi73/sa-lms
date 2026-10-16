import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { GuardianRepository } from "@repo/shared/infrastructure/repository/guardian.repository";
import type {
  CreateGuardianDto,
  UpdateGuardianDto,
} from "@repo/shared/schemas/guardian.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GuardianService {
  private readonly guardianRepository: GuardianRepository;

  constructor(private readonly prisma: PrismaService) {
    this.guardianRepository = new GuardianRepository(this.prisma.client);
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

  async findAll(
    userId: string,
    page: number,
    limit: number,
    filters?: { search?: string | undefined },
  ) {
    return this.guardianRepository.findAll(page, limit, {
      ...filters,
      institutionId: await this.institutionIdFor(userId),
    });
  }

  async findOne(id: string, userId: string) {
    const guardian = await this.guardianRepository.findById(
      id,
      await this.institutionIdFor(userId),
    );
    if (!guardian) throw new NotFoundException("Guardian not found");
    return guardian;
  }

  async create(dto: CreateGuardianDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);

    if (!dto.studentId) {
      throw new BadRequestException("Student selection is required");
    }

    const student = await this.prisma.client.student.findFirst({
      where: {
        id: dto.studentId,
        deletedAt: null,
        profile: { institutionId },
      },
      select: { id: true },
    });

    if (!student) {
      throw new NotFoundException("Student not found");
    }

    return this.guardianRepository.create({
      institutionId,
      studentId: student.id,
      fullName: dto.fullName,
      ...(dto.relationship !== undefined
        ? { relationship: dto.relationship }
        : {}),
      ...(dto.phoneNumber !== undefined
        ? { phoneNumber: dto.phoneNumber }
        : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.occupation !== undefined ? { occupation: dto.occupation } : {}),
    });
  }

  async update(id: string, dto: UpdateGuardianDto, userId: string) {
    await this.findOne(id, userId);
    return this.guardianRepository.update(id, {
      ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
      ...(dto.relationship !== undefined
        ? { relationship: dto.relationship }
        : {}),
      ...(dto.phoneNumber !== undefined
        ? { phoneNumber: dto.phoneNumber }
        : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.occupation !== undefined ? { occupation: dto.occupation } : {}),
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.guardianRepository.delete(id);
    return { success: true, id };
  }
}
