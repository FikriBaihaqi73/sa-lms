import type { Prisma } from "#generated/client";

export const studentSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,

  profileId: true,
  departmentId: true,
  academicStatusId: true,
  studentNumber: true,
  enrollmentYear: true,
  referralCode: true,
  referralExpiresAt: true,

  profile: {
    select: {
      id: true,
      userId: true,
      institutionId: true,
      roleId: true,
      fullName: true,
      identityNumber: true,
      gender: true,
      birthPlace: true,
      birthDate: true,
      religionId: true,
      nationalityId: true,
      address: true,
      phoneNumber: true,
      email: true,
      photoUrl: true,
      institution: {
        select: {
          id: true,
          name: true,
          shortName: true,
        },
      },
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },

  assignmentSubmissions: {
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      assignmentId: true,
      studentId: true,
      submittedAt: true,
      score: true,
      feedback: true,
      status: true,
      gradedBy: true,
      gradedAt: true,

      assignment: {
        select: {
          id: true,
          module_id: true,
          assignment_type_id: true,
          title: true,
          description: true,
          due_date: true,
          max_score: true,

          assignment_type: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },

          module: {
            select: {
              id: true,
              title: true,

              class_subject: {
                select: {
                  id: true,
                  class_id: true,
                  subject_id: true,
                  teacher_id: true,
                  academic_year_id: true,

                  teacher: true,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.StudentSelect;

export type StudentEntity = Prisma.StudentGetPayload<{
  select: typeof studentSelect;
}>;
