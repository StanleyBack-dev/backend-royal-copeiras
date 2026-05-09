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
import { BuildBudgetProposalPdfPayloadService } from "./services/pdf/build-budget-proposal-pdf-payload.service";
import { GenerateBudgetProposalPdfDocumentService } from "./services/pdf/generate-budget-proposal-pdf-document.service";
import { GenerateBudgetPreviewPdfService } from "./services/pdf/generate-budget-preview-pdf.service";
import { MailModule } from "../mails/mail.module";
import { SendBudgetEmailService } from "./services/pdf/send-budget-email.service";
import { SendBudgetEmailResolver } from "./resolvers/pdf/send-budget-email.resolver";
import { PositionsEntity } from "../positions/entities/positions.entity";

@Module({
  imports: [
    AuthModule,
    PdfGeneratorModule,
    MailModule,
    TypeOrmModule.forFeature([
      BudgetsEntity,
      BudgetItemsEntity,
      LeadsEntity,
      PositionsEntity,
    ]),
  ],
  providers: [
    BuildBudgetPdfSnapshotService,
    BuildBudgetProposalPdfPayloadService,
    GenerateBudgetProposalPdfDocumentService,
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
