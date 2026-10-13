import { Injectable, NotFoundException } from "@nestjs/common";
import { ClassAnnouncementRepository } from "@repo/shared/infrastructure/repository/class-announcement.repository";
import type {
  ClassAnnouncementSearchDto,
  CreateClassAnnouncementDto,
  UpdateClassAnnouncementDto,
} from "@repo/shared/schemas/class-announcement.schema";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class ClassAnnouncementsService {
  private repository: ClassAnnouncementRepository;

  constructor(private readonly prisma: PrismaService) {
    this.repository = new ClassAnnouncementRepository(this.prisma.client);
  }

  async create(dto: CreateClassAnnouncementDto) {
    return this.repository.create({
      classId: dto.classId,
      title: dto.title,
      ...(dto.content !== undefined ? { content: dto.content } : {}),
    });
  }

  async findAll(
    query: ClassAnnouncementSearchDto,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    return this.repository.findAll({
      skip,
      take: limit,
      ...(query.search !== undefined ? { search: query.search } : {}),
    });
  }

  async findById(id: string) {
    const classAnnouncement = await this.repository.findById(id);
    if (!classAnnouncement) {
      throw new NotFoundException(`Class Announcement with ID ${id} not found`);
    }
    return classAnnouncement;
  }

  async update(id: string, dto: UpdateClassAnnouncementDto) {
    const classAnnouncement = await this.findById(id);

    return this.repository.update(classAnnouncement.id, {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.content !== undefined ? { content: dto.content } : {}),
    });
  }

  async remove(id: string) {
    const classAnnouncement = await this.findById(id);
    return this.repository.delete(classAnnouncement.id);
  }
}
