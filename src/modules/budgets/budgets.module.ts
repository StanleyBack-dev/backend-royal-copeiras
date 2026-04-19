import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { BudgetsEntity } from "./entities/budgets.entity";
import { BudgetItemsEntity } from "./entities/budgetItems.entity";
import { LeadsEntity } from "../leads/entities/leads.entity";
import { CreateBudgetsService } from "./services/create/create-budgets.service";
import { GetBudgetsService } from "./services/get/get-budgets.service";
import { UpdateBudgetsService } from "./services/update/update-budgets.service";
import { CreateBudgetsResolver } from "./resolvers/create/create-budgets.resolver";
import { GetBudgetsResolver } from "./resolvers/get/get-budgets.resolver";
import { UpdateBudgetsResolver } from "./resolvers/update/update-budgets.resolver";
import { GenerateBudgetPreviewResolver } from "./resolvers/pdf/generate-budget-preview.resolver";
import { PdfGeneratorModule } from "../pdf-generator/pdf-generator.module";
import { BuildBudgetPdfSnapshotService } from "./services/pdf/build-budget-pdf-snapshot.service";
import { GenerateBudgetPreviewPdfService } from "./services/pdf/generate-budget-preview-pdf.service";
import { MapBudgetPdfDrawTextsService } from "./services/pdf/map-budget-pdf-draw-texts.service";
import { MailModule } from "../mails/mail.module";
import { SendBudgetEmailService } from "./services/pdf/send-budget-email.service";
import { SendBudgetEmailResolver } from "./resolvers/pdf/send-budget-email.resolver";

@Module({
  imports: [
    AuthModule,
    PdfGeneratorModule,
    MailModule,
    TypeOrmModule.forFeature([BudgetsEntity, BudgetItemsEntity, LeadsEntity]),
  ],
  providers: [
    BuildBudgetPdfSnapshotService,
    MapBudgetPdfDrawTextsService,
    GenerateBudgetPreviewPdfService,
    SendBudgetEmailService,
    CreateBudgetsService,
    CreateBudgetsResolver,
    GetBudgetsService,
    GetBudgetsResolver,
    UpdateBudgetsService,
    UpdateBudgetsResolver,
    GenerateBudgetPreviewResolver,
    SendBudgetEmailResolver,
  ],
  exports: [CreateBudgetsService, GetBudgetsService, UpdateBudgetsService],
})
export class BudgetsModule {}
