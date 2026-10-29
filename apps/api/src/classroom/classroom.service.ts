import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ClassroomRepository } from "@repo/shared/infrastructure/repository/classroom.repository";
import type {
	CreateClassroomDto,
	UpdateClassroomDto,
} from "@repo/shared/schemas/classroom.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ClassroomService {
	private readonly classroomRepository: ClassroomRepository;

	constructor(private readonly prisma: PrismaService) {
		this.classroomRepository = new ClassroomRepository(this.prisma.client);
	}

	async findAll(
		page: number,
		limit: number,
		filters?: { search?: string | undefined },
	) {
		return this.classroomRepository.findAll(page, limit, filters);
	}

	async findOne(id: string) {
		const classroom = await this.classroomRepository.findById(id);
		if (!classroom) throw new NotFoundException("Classroom not found");
		return classroom;
	}

	async create(dto: CreateClassroomDto) {
		const existing = await this.classroomRepository.findByRoomCode(
			dto.roomCode,
		);
		if (existing) {
			throw new ConflictException("Kode ruangan sudah digunakan.");
		}

		try {
			return await this.classroomRepository.create({
				institutionId: dto.institutionId,
				roomCode: dto.roomCode,
				roomName: dto.roomName,
				...(dto.building !== undefined ? { building: dto.building } : {}),
				...(dto.floor !== undefined ? { floor: dto.floor } : {}),
				...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
				...(dto.description !== undefined
					? { description: dto.description }
					: {}),
			});
		} catch (error: unknown) {
			const prismaError = error as { code?: string };
			if (prismaError?.code === "P2003") {
				throw new BadRequestException("Institusi tidak ditemukan.");
			}
			throw error;
		}
	}

	async update(id: string, dto: UpdateClassroomDto) {
		await this.findOne(id);

		if (dto.roomCode) {
			const existing = await this.classroomRepository.findByRoomCode(
				dto.roomCode,
			);
			if (existing && existing.id !== id) {
				throw new ConflictException("Kode ruangan sudah digunakan.");
			}
		}

		return this.classroomRepository.update(id, {
			...(dto.institutionId !== undefined
				? { institutionId: dto.institutionId }
				: {}),
			...(dto.roomCode !== undefined ? { roomCode: dto.roomCode } : {}),
			...(dto.roomName !== undefined ? { roomName: dto.roomName } : {}),
			...(dto.building !== undefined ? { building: dto.building } : {}),
			...(dto.floor !== undefined ? { floor: dto.floor } : {}),
			...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
			...(dto.description !== undefined
				? { description: dto.description }
				: {}),
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.classroomRepository.delete(id);
		return { success: true, id };
	}
}
