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
import { FreezeBudgetPdfResolver } from "./resolvers/pdf/freeze-budget-pdf.resolver";
import { DownloadBudgetPdfResolver } from "./resolvers/pdf/download-budget-pdf.resolver";
import { PdfGeneratorModule } from "../pdf-generator/pdf-generator.module";
import { BuildBudgetPdfSnapshotService } from "./services/pdf/build-budget-pdf-snapshot.service";
import { GenerateBudgetPreviewPdfService } from "./services/pdf/generate-budget-preview-pdf.service";
import { FreezeBudgetPdfService } from "./services/pdf/freeze-budget-pdf.service";
import { DownloadBudgetPdfService } from "./services/pdf/download-budget-pdf.service";
import { MapBudgetPdfDrawTextsService } from "./services/pdf/map-budget-pdf-draw-texts.service";

@Module({
  imports: [
    AuthModule,
    PdfGeneratorModule,
    TypeOrmModule.forFeature([BudgetsEntity, BudgetItemsEntity, LeadsEntity]),
  ],
  providers: [
    BuildBudgetPdfSnapshotService,
    MapBudgetPdfDrawTextsService,
    GenerateBudgetPreviewPdfService,
    FreezeBudgetPdfService,
    DownloadBudgetPdfService,
    CreateBudgetsService,
    CreateBudgetsResolver,
    GetBudgetsService,
    GetBudgetsResolver,
    UpdateBudgetsService,
    UpdateBudgetsResolver,
    GenerateBudgetPreviewResolver,
    FreezeBudgetPdfResolver,
    DownloadBudgetPdfResolver,
  ],
  exports: [CreateBudgetsService, GetBudgetsService, UpdateBudgetsService],
})
export class BudgetsModule {}
