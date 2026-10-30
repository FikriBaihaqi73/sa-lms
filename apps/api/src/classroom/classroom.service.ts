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

	private async institutionIdFor(userId: string): Promise<string> {
		const profile = await this.prisma.client.profile.findFirst({
			where: { userId, deletedAt: null },
			select: { institutionId: true },
		});
		if (!profile) {
			throw new NotFoundException("Institution not found");
		}
		return profile.institutionId;
	}

	async findAll(
		userId: string | undefined,
		page: number,
		limit: number,
		filters?: { search?: string | undefined },
	) {
		const institutionId = userId
			? await this.institutionIdFor(userId)
			: undefined;
		return this.classroomRepository.findAll(page, limit, filters, institutionId);
	}

	async findOne(id: string, userId: string | undefined) {
		const institutionId = userId
			? await this.institutionIdFor(userId)
			: undefined;
		const classroom = await this.classroomRepository.findById(id, institutionId);
		if (!classroom) throw new NotFoundException("Classroom not found");
		return classroom;
	}

	async create(userId: string | undefined, dto: CreateClassroomDto) {
		const institutionId =
			dto.institutionId && dto.institutionId.trim() !== ""
				? dto.institutionId.trim()
				: userId
					? await this.institutionIdFor(userId)
					: null;

		if (!institutionId) {
			throw new BadRequestException("Institusi tidak ditemukan.");
		}

		const existing = await this.classroomRepository.findByRoomCode(
			dto.roomCode,
		);
		if (existing) {
			throw new ConflictException("Kode ruangan sudah digunakan.");
		}

		try {
			return await this.classroomRepository.create({
				institutionId,
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
			if (prismaError?.code === "P2002") {
				throw new ConflictException("Kode ruangan sudah digunakan.");
			}
			throw error;
		}
	}

	async update(id: string, userId: string | undefined, dto: UpdateClassroomDto) {
		await this.findOne(id, userId);

		const institutionId = userId
			? await this.institutionIdFor(userId)
			: undefined;

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
				: institutionId !== undefined
					? { institutionId }
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

	async remove(id: string, userId: string | undefined) {
		await this.findOne(id, userId);
		await this.classroomRepository.delete(id);
		return { success: true, id };
	}
}
