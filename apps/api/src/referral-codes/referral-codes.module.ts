import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ReferralCodesController } from "./referral-codes.controller";
import { ReferralCodesService } from "./referral-codes.service";

@Module({
  imports: [PrismaModule],
  controllers: [ReferralCodesController],
  providers: [ReferralCodesService],
  exports: [ReferralCodesService],
})
export class ReferralCodesModule {}
