import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import type {
  CreateStudyResultDto,
  UpdateStudyResultDto,
} from "@repo/shared/schemas/study-result.schema";
import { StudyResultController } from "./study-result.controller";
import { StudyResultService } from "./study-result.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {
    client = {};
  },
}));

describe("StudyResultController", () => {
  let controller: StudyResultController;
  let service: StudyResultService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByStudentId: jest.fn(),
    findByAcademicYearId: jest.fn(),
    findBySemesterId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudyResultController],
      providers: [
        {
          provide: StudyResultService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<StudyResultController>(StudyResultController);
    service = module.get<StudyResultService>(StudyResultService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  const mockRecord = {
    id: "sr-1",
    studentId: "student-1",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    totalCredits: 24,
    semesterGpa: 3.85,
    cumulativeGpa: 3.8,
    academicStatusId: "status-active",
  };

  it("findAll returns paginated list wrapped in ResponseHelper.success", async () => {
    const mockResult = {
      data: [mockRecord],
      meta: { totalData: 1, totalPages: 1, currentPage: 1, perPage: 10 },
    };
    mockService.findAll.mockResolvedValue(mockResult);

    const result = await controller.findAll("1", "10", "John");

    expect(result).toEqual(
      ResponseHelper.success(
        [mockRecord],
        "Study results retrieved successfully",
        200,
        mockResult.meta,
      ),
    );
    expect(service.findAll).toHaveBeenCalledWith(1, 10, "John");
  });

  it("findOne returns detail wrapped in ResponseHelper.success", async () => {
    mockService.findOne.mockResolvedValue(mockRecord);

    const result = await controller.findOne("sr-1");

    expect(result).toEqual(
      ResponseHelper.success(
        mockRecord,
        "Study result detail retrieved successfully",
      ),
    );
    expect(service.findOne).toHaveBeenCalledWith("sr-1");
  });

  it("findByStudentId returns list wrapped in ResponseHelper.success", async () => {
    mockService.findByStudentId.mockResolvedValue([mockRecord]);

    const result = await controller.findByStudentId("student-1");

    expect(result).toEqual(
      ResponseHelper.success(
        [mockRecord],
        "Study results by student retrieved successfully",
      ),
    );
    expect(service.findByStudentId).toHaveBeenCalledWith("student-1");
  });

  it("findByAcademicYearId returns list wrapped in ResponseHelper.success", async () => {
    mockService.findByAcademicYearId.mockResolvedValue([mockRecord]);

    const result = await controller.findByAcademicYearId("ay-1");

    expect(result).toEqual(
      ResponseHelper.success(
        [mockRecord],
        "Study results by academic year retrieved successfully",
      ),
    );
    expect(service.findByAcademicYearId).toHaveBeenCalledWith("ay-1");
  });

  it("findBySemesterId returns list wrapped in ResponseHelper.success", async () => {
    mockService.findBySemesterId.mockResolvedValue([mockRecord]);

    const result = await controller.findBySemesterId("sem-1");

    expect(result).toEqual(
      ResponseHelper.success(
        [mockRecord],
        "Study results by semester retrieved successfully",
      ),
    );
    expect(service.findBySemesterId).toHaveBeenCalledWith("sem-1");
  });

  it("create returns created record wrapped in ResponseHelper.success with 201 status", async () => {
    mockService.create.mockResolvedValue(mockRecord);

    const dto: CreateStudyResultDto = {
      studentId: "student-1",
      academicYearId: "ay-1",
      semesterId: "sem-1",
    };

    const result = await controller.create(dto);

    expect(result).toEqual(
      ResponseHelper.success(
        mockRecord,
        "Study result created successfully",
        201,
      ),
    );
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it("update returns updated record wrapped in ResponseHelper.success", async () => {
    const updated = { ...mockRecord, semesterGpa: 3.9 };
    mockService.update.mockResolvedValue(updated);

    const dto: UpdateStudyResultDto = { semesterGpa: 3.9 };

    const result = await controller.update("sr-1", dto);

    expect(result).toEqual(
      ResponseHelper.success(updated, "Study result updated successfully"),
    );
    expect(service.update).toHaveBeenCalledWith("sr-1", dto);
  });

  it("remove returns deleted result wrapped in ResponseHelper.success", async () => {
    mockService.remove.mockResolvedValue(mockRecord);

    const result = await controller.remove("sr-1");

    expect(result).toEqual(
      ResponseHelper.success(mockRecord, "Study result deleted successfully"),
    );
    expect(service.remove).toHaveBeenCalledWith("sr-1");
  });
});
