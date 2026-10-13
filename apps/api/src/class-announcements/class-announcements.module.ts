import { Module } from "@nestjs/common";
import { ClassAnnouncementsController } from "./class-announcements.controller.js";
import { ClassAnnouncementsService } from "./class-announcements.service.js";

@Module({
  controllers: [ClassAnnouncementsController],
  providers: [ClassAnnouncementsService],
  exports: [ClassAnnouncementsService],
})
export class ClassAnnouncementsModule {}
