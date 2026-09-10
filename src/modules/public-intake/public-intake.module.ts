// LIBS
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { MailModule } from "../mails/mail.module";

// ENTITIES
import { PublicIntakeCodeEntity } from "./entities/public-intake-code.entity";
import { LeadsEntity } from "../leads/entities/leads.entity";
import { BudgetsEntity } from "../budgets/entities/budgets.entity";
import { SuppliesEntity } from "../supplies/entities/supplies.entity";

// SERVICES
import { PublicIntakeCodesService } from "./services/public-intake-codes.service";
import { GeneratePublicIntakeCodeService } from "./services/generate/generate-public-intake-code.service";
import { VerifyPublicIntakeCodeService } from "./services/verify/verify-public-intake-code.service";
import { SubmitPublicIntakeService } from "./services/submit/submit-public-intake.service";
import { GetPublicIntakeCodesService } from "./services/get/get-public-intake-codes.service";

// RESOLVERS
import { GeneratePublicIntakeCodeResolver } from "./resolvers/generate/generate-public-intake-code.resolver";
import { VerifyPublicIntakeCodeResolver } from "./resolvers/verify/verify-public-intake-code.resolver";
import { SubmitPublicIntakeResolver } from "./resolvers/submit/submit-public-intake.resolver";
import { GetPublicIntakeCodesResolver } from "./resolvers/get/get-public-intake-codes.resolver";

@Module({
  imports: [
    AuthModule,
    MailModule,
    TypeOrmModule.forFeature([
      PublicIntakeCodeEntity,
      LeadsEntity,
      BudgetsEntity,
      SuppliesEntity,
    ]),
  ],
  providers: [
    PublicIntakeCodesService,
    GeneratePublicIntakeCodeService,
    GeneratePublicIntakeCodeResolver,
    VerifyPublicIntakeCodeService,
    VerifyPublicIntakeCodeResolver,
    SubmitPublicIntakeService,
    SubmitPublicIntakeResolver,
    GetPublicIntakeCodesService,
    GetPublicIntakeCodesResolver,
  ],
})
export class PublicIntakeModule {}
