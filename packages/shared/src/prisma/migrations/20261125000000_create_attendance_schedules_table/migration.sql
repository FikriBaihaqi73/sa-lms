-- CreateTable
CREATE TABLE "attendance_schedules" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,
    "academic_year_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "schedule_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "schedule_type" VARCHAR(50) NOT NULL,
    "active_days" TEXT[],
    "specific_date" DATE,
    "start_time" TIME(0),
    "end_time" TIME(0),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "attendance_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_schedules_academic_year_id_idx" ON "attendance_schedules"("academic_year_id");

-- CreateIndex
CREATE INDEX "attendance_schedules_class_id_idx" ON "attendance_schedules"("class_id");

-- CreateIndex
CREATE INDEX "attendance_schedules_schedule_id_idx" ON "attendance_schedules"("schedule_id");

-- AddForeignKey
ALTER TABLE "attendance_schedules" ADD CONSTRAINT "attendance_schedules_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_schedules" ADD CONSTRAINT "attendance_schedules_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_schedules" ADD CONSTRAINT "attendance_schedules_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
