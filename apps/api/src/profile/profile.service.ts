import { Injectable, NotFoundException } from "@nestjs/common";
import { ProfileRepository } from "@repo/shared/infrastructure/repository/profile.repository";
import type {
  CreateProfileDto,
  UpdateProfileDto,
} from "@repo/shared/schemas/profile.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProfileService {
  private profileRepository: ProfileRepository;

  constructor(private readonly prisma: PrismaService) {
    this.profileRepository = new ProfileRepository(this.prisma.client);
  }

  async findAll(page = 1, limit = 10, search?: string) {
    return this.profileRepository.findAll({
      page,
      limit,
      ...(search !== undefined ? { search } : {}),
    });
  }

  async findOne(id: string) {
    const profile = await this.profileRepository.findById(id);
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }
    return profile;
  }

  async findByUserId(userId: string) {
    let profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      const user = await this.prisma.client.users.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException("User not found");
      }
      const defaultInstitution =
        await this.prisma.client.institution.findFirst();
      const defaultRole = await this.prisma.client.role.findFirst();

      if (defaultInstitution && defaultRole) {
        profile = await this.profileRepository.create({
          userId: user.id,
          roleId: defaultRole.id,
          institutionId: defaultInstitution.id,
          fullName: user.email.split("@")[0] || "Admin User",
          email: user.email,
        });
      }
    }
    return profile;
  }

  async create(dto: CreateProfileDto) {
    return this.profileRepository.create({
      userId: dto.userId,
      roleId: dto.roleId,
      institutionId: dto.institutionId,
      fullName: dto.fullName,
      ...(dto.identityNumber !== undefined
        ? { identityNumber: dto.identityNumber }
        : {}),
      ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
      ...(dto.birthPlace !== undefined ? { birthPlace: dto.birthPlace } : {}),
      ...(dto.birthDate !== undefined
        ? { birthDate: new Date(dto.birthDate) }
        : {}),
      ...(dto.religionId !== undefined ? { religionId: dto.religionId } : {}),
      ...(dto.nationalityId !== undefined
        ? { nationalityId: dto.nationalityId }
        : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.phoneNumber !== undefined
        ? { phoneNumber: dto.phoneNumber }
        : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.photoUrl !== undefined ? { photoUrl: dto.photoUrl } : {}),
    });
  }

  async update(id: string, dto: UpdateProfileDto) {
    await this.findOne(id);
    return this.profileRepository.update(id, {
      ...(dto.institutionId !== undefined
        ? { institutionId: dto.institutionId }
        : {}),
      ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
      ...(dto.identityNumber !== undefined
        ? { identityNumber: dto.identityNumber }
        : {}),
      ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
      ...(dto.birthPlace !== undefined ? { birthPlace: dto.birthPlace } : {}),
      ...(dto.birthDate !== undefined
        ? { birthDate: new Date(dto.birthDate) }
        : {}),
      ...(dto.religionId !== undefined ? { religionId: dto.religionId } : {}),
      ...(dto.nationalityId !== undefined
        ? { nationalityId: dto.nationalityId }
        : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.phoneNumber !== undefined
        ? { phoneNumber: dto.phoneNumber }
        : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.photoUrl !== undefined ? { photoUrl: dto.photoUrl } : {}),
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.profileRepository.delete(id);
    return { success: true, id };
  }
}
