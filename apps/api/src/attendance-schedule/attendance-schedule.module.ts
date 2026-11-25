import { Module } from "@nestjs/common";
import { AttendanceScheduleController } from "./attendance-schedule.controller";
import { AttendanceScheduleService } from "./attendance-schedule.service";

@Module({
  controllers: [AttendanceScheduleController],
  providers: [AttendanceScheduleService],
  exports: [AttendanceScheduleService],
})
export class AttendanceScheduleModule {}
