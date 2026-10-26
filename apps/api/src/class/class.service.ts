import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ClassRepository } from "@repo/shared/infrastructure/repository/class.repository";
import type {
  CreateClassDto,
  UpdateClassDto,
} from "@repo/shared/schemas/class.schema";
import { PrismaService } from "../prisma/prisma.service";
import { AcademicYearService } from "../academic-year/academic-year.service";

@Injectable()
export class ClassService {
  private readonly classRepository: ClassRepository;

  constructor(
    private readonly prisma: PrismaService,
    private readonly academicYearService: AcademicYearService,
  ) {
    this.classRepository = new ClassRepository(this.prisma.client);
  }

  private async institutionIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.client.profile.findFirst({
      where: { userId, deletedAt: null },
      select: { institutionId: true },
    });
    if (!profile) {
      throw new ForbiddenException("Institution access is required");
    }
    return profile.institutionId;
  }

  async findAll(page = 1, limit = 10, search: string | undefined, userId: string) {
    return this.classRepository.findAll({
      page,
      limit,
      institution_id: await this.institutionIdFor(userId),
      ...(search !== undefined ? { search } : {}),
    });
  }

  async findOne(id: string, userId: string) {
    const classEntity = await this.classRepository.findById(
      id,
      await this.institutionIdFor(userId),
    );
    if (!classEntity) {
      throw new NotFoundException("Class not found");
    }
    return classEntity;
  }

  async create(dto: CreateClassDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    await this.academicYearService.findOne(dto.academic_year_id, userId);
    return this.classRepository.create({
      institution_id: institutionId,
      academic_year_id: dto.academic_year_id,
      name: dto.name,
      grade_level: dto.grade_level,
      ...(dto.homeroom_teacher_id !== undefined
        ? { homeroom_teacher_id: dto.homeroom_teacher_id }
        : {}),
    });
  }

  async update(id: string, dto: UpdateClassDto, userId: string) {
    await this.findOne(id, userId);
    if (dto.academic_year_id !== undefined) {
      await this.academicYearService.findOne(dto.academic_year_id, userId);
    }
    return this.classRepository.update(id, {
      ...(dto.homeroom_teacher_id !== undefined
        ? { homeroom_teacher_id: dto.homeroom_teacher_id }
        : {}),
      ...(dto.academic_year_id !== undefined
        ? { academic_year_id: dto.academic_year_id }
        : {}),
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.grade_level !== undefined
        ? { grade_level: dto.grade_level }
        : {}),
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.classRepository.delete(id);
    return { success: true, id };
  }
}
