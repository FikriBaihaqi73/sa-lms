import type { PrismaClient } from "#generated/client";
import { TeachingJournalRepository } from "./journals.repository";

describe("TeachingJournalRepository scope", () => {
  const findMany = jest.fn();
  const count = jest.fn();
  const findFirst = jest.fn();
  const updateMany = jest.fn();
  const schedule = { findFirst: jest.fn() };
  const journals = {
    findMany,
    count,
    findFirst,
    updateMany,
    create: jest.fn(),
  };
  const transaction = jest.fn(async (fn: (tx: unknown) => unknown) =>
    fn({ schedule, teachingJournals: journals }),
  );
  const repository = new TeachingJournalRepository({
    teachingJournals: journals,
    schedule,
    $transaction: transaction,
  } as unknown as PrismaClient);
  const scope = { institutionId: "A", teacherId: "T" };
  beforeEach(() => {
    jest.clearAllMocks();
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
  });
  it("scopes list and count together with filters and pagination", async () => {
    await repository.findAll(
      2,
      5,
      { search: "topic", schedule_id: "s", journal_date: "2026-01-01" },
      scope,
    );
    const args = findMany.mock.calls[0][0];
    expect(args).toMatchObject({
      skip: 5,
      take: 5,
      where: {
        schedule_id: "s",
        journal_date: new Date("2026-01-01"),
        schedule: {
          classroom: { institutionId: "A" },
          classSubject: { teacher_id: "T", class: { institution_id: "A" } },
        },
      },
    });
    expect(count.mock.calls[0][0].where).toEqual(args.where);
    expect(args.where.OR).toHaveLength(3);
  });
  it("scopes detail, including institution for admin", async () => {
    await repository.findById("j", { institutionId: "A" });
    expect(findFirst.mock.calls[0][0]).toMatchObject({
      where: {
        id: "j",
        schedule: {
          classroom: { institutionId: "A" },
          classSubject: { class: { institution_id: "A" } },
        },
      },
    });
  });
  it("rejects a schedule outside teacher scope", async () => {
    schedule.findFirst.mockResolvedValue(null);
    await expect(
      repository.create({ schedule_id: "other" }, scope, "u"),
    ).resolves.toBeNull();
    expect(schedule.findFirst.mock.calls[0][0]).toMatchObject({
      where: {
        id: "other",
        classSubject: { teacher_id: "T", class: { institution_id: "A" } },
      },
    });
    expect(journals.create).not.toHaveBeenCalled();
  });
  it("writes owner on creation", async () => {
    schedule.findFirst.mockResolvedValue({ id: "s" });
    journals.create.mockResolvedValue({ id: "j" });
    await repository.create({ schedule_id: "s" }, scope, "u");
    expect(journals.create.mock.calls[0][0].data).toMatchObject({
      schedule_id: "s",
      created_by: "u",
    });
  });
  it("includes owner, teacher and institution in mutation predicates", async () => {
    updateMany.mockResolvedValue({ count: 0 });
    await repository.update("j", { notes: "x" }, scope, "u");
    await repository.delete("j", scope, "u");
    for (const [args] of updateMany.mock.calls) {
      expect(args.where).toMatchObject({
        id: "j",
        deleted_at: null,
        created_by: "u",
        schedule: {
          classroom: { institutionId: "A" },
          classSubject: { teacher_id: "T", class: { institution_id: "A" } },
        },
      });
    }
  });
});
