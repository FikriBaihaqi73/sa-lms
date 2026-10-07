import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AcademicStatusModule } from "./academic-status/academic-status.module";
import { AcademicYearModule } from "./academic-year/academic-year.module";
import { ActivityLogModule } from "./activity-log/activity-log.module";
import { AnnouncementModule } from "./announcement/announcement.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AssignmentModule } from "./assignment/assignment.module";
import { AssignmentSubmissionModule } from "./assignment-submission/assignment-submission.module";
import { AssignmentTypeModule } from "./assignment-type/assignment-type.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { AttendanceStatusModule } from "./attendance-status/attendance-status.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { RolesGuard } from "./auth/roles.guard";
import { ClassModule } from "./class/class.module";
import { ClassAnnouncementsModule } from "./class-announcements/class-announcements.module";
import { ClassStudentModule } from "./class-student/class-student.module";
import { ClassSubjectModule } from "./class-subject/class-subject.module";
import { ClassroomModule } from "./classroom/classroom.module";
import { DepartmentsModule } from "./departments/departments.module";
import { EmploymentStatusModule } from "./employment-status/employment-status.module";
import { ExaminationModule } from "./examination/examination.module";
import { ExaminationScoreModule } from "./examination-score/examination-score.module";
import { FilesModule } from "./files/files.module";
import { GuardianModule } from "./guardian/guardian.module";
import { InstitutionModule } from "./institution/institution.module";
import { InstitutionLevelModule } from "./institution-level/institution-level.module";
import { LearningModuleModule } from "./module/module.module";
import { ModuleContentModule } from "./module-content/module-content.module";
import { NationalityModule } from "./nationality/nationality.module";
import { NotificationModule } from "./notification/notification.module";
import { PermissionModule } from "./permission/permission.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProfileModule } from "./profile/profile.module";
import { ReligionModule } from "./religion/religion.module";
import { RoleModule } from "./role/role.module";
import { RolePermissionModule } from "./role-permission/role-permission.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { SemesterModule } from "./semester/semester.module";
import { SettingsModule } from "./settings/settings.module";
import { SpecializationModule } from "./specialization/specialization.module";
import { StudentModule } from "./student/student.module";
import { StudentGradeModule } from "./student-grade/student-grade.module";
import { StudentGuardianModule } from "./student-guardian/student-guardian.module";
import { StudyPlanModule } from "./study-plan/study-plan.module";
import { StudyResultModule } from "./study-result/study-result.module";
import { SubjectModule } from "./subject/subject.module";
import { SubjectPrerequisiteModule } from "./subject-prerequisite/subject-prerequisite.module";
import { TeachersModule } from "./teachers/teachers.module";
import { TeachingJournalModule } from "./teaching-journal/teaching-journal.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    RolePermissionModule,
    InstitutionLevelModule,
    InstitutionModule,
    AcademicYearModule,
    AcademicStatusModule,
    EmploymentStatusModule,
    GuardianModule,
    AttendanceStatusModule,
    SpecializationModule,
    AttendanceModule,
    StudyPlanModule,
    StudyResultModule,
    LearningModuleModule,
    ModuleContentModule,
    TeachingJournalModule,
    NationalityModule,
    ReligionModule,
    ProfileModule,
    AssignmentTypeModule,
    AssignmentSubmissionModule,
    AssignmentModule,
    DepartmentsModule,
    TeachersModule,
    UserModule,
    StudentGuardianModule,
    StudentModule,
    ClassStudentModule,
    ClassModule,
    ClassModule,
    SubjectModule,
    SubjectPrerequisiteModule,
    ClassSubjectModule,
    ClassroomModule,
    ScheduleModule,
    StudentGradeModule,
    ExaminationModule,
    ExaminationScoreModule,
    FilesModule,
    NotificationModule,
    ActivityLogModule,
    AnnouncementModule,
    SettingsModule,
    SemesterModule,
    ClassAnnouncementsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
