import { ConflictException, NotFoundException } from "@nestjs/common";
import { AcademicYearRepository } from "@repo/shared/infrastructure/repository/academic-year.repository";
import { ClassSubjectsRepository } from "@repo/shared/infrastructure/repository/class-subjects.repository";
import { StudentRepository } from "@repo/shared/infrastructure/repository/students.repository";
import { StudyPlanRepository } from "@repo/shared/infrastructure/repository/study-plan.repository";
import { CreateStudyPlanDto } from "@repo/shared/schemas/study-plan.schema";
import { PrismaService } from "../prisma/prisma.service";
import { StudyPlanService } from "./study-plan.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("StudyPlanService", () => {
  let service: StudyPlanService;
  const dto = {
    student_id: "student-id",
    class_subject_id: "class-subject-id",
    academic_year_id: "academic-year-id",
  } as CreateStudyPlanDto;

  beforeEach(() => {
    service = new StudyPlanService({} as PrismaService);
    jest
      .spyOn(StudentRepository.prototype, "findById")
      .mockResolvedValue({ id: dto.student_id } as never);
    jest
      .spyOn(ClassSubjectsRepository.prototype, "findById")
      .mockResolvedValue({
        id: dto.class_subject_id,
        academic_year_id: dto.academic_year_id,
      } as never);
    jest
      .spyOn(AcademicYearRepository.prototype, "findById")
      .mockResolvedValue({ id: dto.academic_year_id } as never);
    jest
      .spyOn(
        StudyPlanRepository.prototype,
        "findByStudentClassSubjectAndAcademicYear",
      )
      .mockResolvedValue(null);
  });

  afterEach(() => jest.restoreAllMocks());

  it("forwards the search and department filter when retrieving study plans", async () => {
    const findAll = jest
      .spyOn(StudyPlanRepository.prototype, "findAll")
      .mockResolvedValue({
        data: [],
        meta: { totalData: 0, totalPages: 0, currentPage: 1, perPage: 10 },
      });

    await service.findAll(1, 10, {
      search: "mathematics",
      department_id: "dept-1",
    });

    expect(findAll).toHaveBeenCalledWith(1, 10, {
      search: "mathematics",
      department_id: "dept-1",
    });
  });

  it("automatically resolves academic_year_id from classSubject when not provided", async () => {
    const create = jest
      .spyOn(StudyPlanRepository.prototype, "create")
      .mockResolvedValue({ id: "study-plan-id" } as never);

    await service.create({
      student_id: dto.student_id,
      class_subject_id: dto.class_subject_id,
    } as CreateStudyPlanDto);

    expect(create).toHaveBeenCalledWith({
      student_id: dto.student_id,
      class_subject_id: dto.class_subject_id,
      academic_year_id: dto.academic_year_id,
    });
  });

  it("rejects study plan when academic_year_id does not match class subject", async () => {
    await expect(
      service.create({
        student_id: dto.student_id,
        class_subject_id: dto.class_subject_id,
        academic_year_id: "mismatched-academic-year-id",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects a study plan that references a missing student", async () => {
    jest.spyOn(StudentRepository.prototype, "findById").mockResolvedValue(null);
    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects an existing student, class subject, and academic year combination", async () => {
    jest
      .spyOn(
        StudyPlanRepository.prototype,
        "findByStudentClassSubjectAndAcademicYear",
      )
      .mockResolvedValue({ id: "existing-id" } as never);
    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it("creates and soft-deletes a study plan", async () => {
    const create = jest
      .spyOn(StudyPlanRepository.prototype, "create")
      .mockResolvedValue({ id: "study-plan-id" } as never);
    jest
      .spyOn(StudyPlanRepository.prototype, "findById")
      .mockResolvedValue({ id: "study-plan-id" } as never);
    const remove = jest
      .spyOn(StudyPlanRepository.prototype, "delete")
      .mockResolvedValue({ id: "study-plan-id" } as never);

    await service.create(dto);
    await expect(service.remove("study-plan-id")).resolves.toEqual({
      success: true,
      id: "study-plan-id",
    });
    expect(create).toHaveBeenCalledWith(dto);
    expect(remove).toHaveBeenCalledWith("study-plan-id");
  });
});
