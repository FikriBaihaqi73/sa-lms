import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AcademicYearModule } from "../academic-year/academic-year.module";
import { ClassController } from "./class.controller";
import { ClassService } from "./class.service";

@Module({
  imports: [AuthModule, AcademicYearModule],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
