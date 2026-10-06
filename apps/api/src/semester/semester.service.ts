import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AcademicYearRepository } from "@repo/shared/infrastructure/repository/academic-year.repository";
import { SemesterRepository } from "@repo/shared/infrastructure/repository/semester.repository";
import {
  CreateSemesterDto,
  FindAllSemesterDto,
  UpdateSemesterDto,
} from "@repo/shared/schemas/semester.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SemesterService {
  private readonly repository: SemesterRepository;
  private readonly academicYearRepository: AcademicYearRepository;

  constructor(private readonly prisma: PrismaService) {
    this.repository = new SemesterRepository(this.prisma.client);
    this.academicYearRepository = new AcademicYearRepository(
      this.prisma.client,
    );
  }

  private async ensureAcademicYearExists(id: string) {
    if (!id) {
      throw new BadRequestException("Academic year ID is required");
    }
    const academicYear = await this.academicYearRepository.findById(id);
    if (!academicYear) {
      throw new NotFoundException("Academic year not found");
    }
  }

  async create(dto: CreateSemesterDto) {
    await this.ensureAcademicYearExists(dto.academic_year_id);

    return this.repository.create({
      academic_year_id: dto.academic_year_id,
      name: dto.name,
      ...(dto.start_date !== undefined && {
        start_date: dto.start_date ? new Date(dto.start_date) : null,
      }),
      ...(dto.end_date !== undefined && {
        end_date: dto.end_date ? new Date(dto.end_date) : null,
      }),
      ...(dto.is_active !== undefined && {
        is_active: dto.is_active,
      }),
    });
  }

  async findAll(query: FindAllSemesterDto) {
    return this.repository.findAll({
      ...(query.page !== undefined && { page: query.page }),
      ...(query.limit !== undefined && { limit: query.limit }),
      ...(query.search ? { search: query.search } : {}),
      ...(query.academic_year_id
        ? {
            academic_year_id: query.academic_year_id,
          }
        : {}),
    });
  }

  async findOne(id: string) {
    const semester = await this.repository.findById(id);

    if (!semester) {
      throw new NotFoundException("Semester not found");
    }

    return semester;
  }

  async update(id: string, dto: UpdateSemesterDto) {
    const semester = await this.repository.findById(id);

    if (!semester) {
      throw new NotFoundException("Semester not found");
    }

    if (dto.academic_year_id !== undefined) {
      await this.ensureAcademicYearExists(dto.academic_year_id);
    }

    return this.repository.update(id, {
      ...(dto.academic_year_id !== undefined && {
        academic_year_id: dto.academic_year_id,
      }),
      ...(dto.name !== undefined && {
        name: dto.name,
      }),
      ...(dto.start_date !== undefined && {
        start_date: dto.start_date ? new Date(dto.start_date) : null,
      }),
      ...(dto.end_date !== undefined && {
        end_date: dto.end_date ? new Date(dto.end_date) : null,
      }),
      ...(dto.is_active !== undefined && {
        is_active: dto.is_active,
      }),
    });
  }

  async remove(id: string) {
    const semester = await this.repository.findById(id);

    if (!semester) {
      throw new NotFoundException("Semester not found");
    }

    return this.repository.delete(id);
  }
}
