-- AlterTable
ALTER TABLE "Attendances" ALTER COLUMN "schedule_id" DROP NOT NULL,
ADD COLUMN "attendance_schedule_id" UUID;

-- CreateIndex
CREATE INDEX "Attendances_attendance_schedule_id_idx" ON "Attendances"("attendance_schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "Attendances_attendance_schedule_id_student_id_attendance_date_key" ON "Attendances"("attendance_schedule_id", "student_id", "attendance_date");

-- AddForeignKey
ALTER TABLE "Attendances" ADD CONSTRAINT "Attendances_attendance_schedule_id_fkey" FOREIGN KEY ("attendance_schedule_id") REFERENCES "attendance_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
