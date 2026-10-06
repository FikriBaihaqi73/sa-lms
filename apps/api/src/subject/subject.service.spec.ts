import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { SubjectService } from "./subject.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("SubjectService", () => {
  let service: SubjectService;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPrismaService = {
    client: {
      subject: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SubjectService>(SubjectService);

    // We can spy on the manually created repository inside the service if needed,
    // but the easiest way is to mock Prisma directly.
    mockRepository.create = mockPrismaService.client.subject.create;
    mockRepository.findById = mockPrismaService.client.subject.findFirst;
    // Separate fn: aliasing both to findFirst would make mockResolvedValue
    // calls in the same test overwrite each other (findById vs findByCode).
    mockRepository.findByCode = jest.fn();
    mockRepository.findAll = jest.fn().mockImplementation(async () => {
      const data = await mockPrismaService.client.subject.findMany();
      const total = await mockPrismaService.client.subject.count();
      return { data, total };
    });
    mockRepository.update = mockPrismaService.client.subject.update;
    mockRepository.delete = mockPrismaService.client.subject.update;

    // override the internal repository for testing
    (service as any).subjectRepository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should successfully create a subject", async () => {
      const createDto = {
        code: "SUB01",
        name: "Math",
        institutionId: "inst-id",
      };
      const expectedResult = { id: "1", ...createDto };
      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(mockRepository.findByCode).toHaveBeenCalledWith("SUB01");
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });

    it("should throw ConflictException if code already exists", async () => {
      const createDto = {
        code: "SUB01",
        name: "Math",
        institutionId: "inst-id",
      };
      mockRepository.findByCode.mockResolvedValue({ id: "1", ...createDto });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return a list of subjects and total count", async () => {
      const expectedResult = { data: [{ id: "1", code: "SUB01" }], total: 1 };
      mockRepository.findAll.mockResolvedValue(expectedResult);

      const query = { page: 1, limit: 10 };
      const result = await service.findAll(query);

      expect(mockRepository.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("findOne", () => {
    it("should return a subject if found", async () => {
      const expectedResult = { id: "1", code: "SUB01" };
      mockRepository.findById.mockResolvedValue(expectedResult);

      const result = await service.findOne("1");

      expect(mockRepository.findById).toHaveBeenCalledWith("1");
      expect(result).toEqual(expectedResult);
    });

    it("should throw NotFoundException if not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne("99")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should successfully update a subject", async () => {
      const updateDto = { name: "Advanced Math" };
      const existing = { id: "1", code: "SUB01", name: "Math" };
      const expectedResult = { ...existing, ...updateDto };

      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.update.mockResolvedValue(expectedResult);

      const result = await service.update("1", updateDto);

      expect(mockRepository.findById).toHaveBeenCalledWith("1");
      expect(mockRepository.update).toHaveBeenCalledWith("1", updateDto);
      expect(result).toEqual(expectedResult);
    });

    it("should throw ConflictException if new code already exists", async () => {
      const updateDto = { code: "SUB02" };
      const existing = { id: "1", code: "SUB01" };
      const existingOther = { id: "2", code: "SUB02" };

      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.findByCode.mockResolvedValue(existingOther);

      await expect(service.update("1", updateDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw NotFoundException if subject not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update("99", {})).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should successfully delete a subject", async () => {
      const existing = { id: "1", code: "SUB01" };
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.delete.mockResolvedValue(existing);

      await service.remove("1");

      expect(mockRepository.findById).toHaveBeenCalledWith("1");
      expect(mockRepository.delete).toHaveBeenCalledWith("1");
    });

    it("should throw NotFoundException if subject not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.remove("99")).rejects.toThrow(NotFoundException);
    });
  });
});
