import { Module } from "@nestjs/common";
import { PdfGeneratorService } from "./services/pdf-generator.service";
import { PdfTemplateResolverService } from "./services/pdf-template-resolver.service";
import { PdfSnapshotHashService } from "./services/pdf-snapshot-hash.service";
import { PdfTemplateEngineService } from "./services/pdf-template-engine.service";
import { RenderBudgetProposalTemplateService } from "./templates/budgets/render-budget-proposal-template.service";

@Module({
  providers: [
    PdfGeneratorService,
    PdfTemplateResolverService,
    PdfSnapshotHashService,
    PdfTemplateEngineService,
    RenderBudgetProposalTemplateService,
  ],
  exports: [
    PdfGeneratorService,
    PdfTemplateResolverService,
    PdfSnapshotHashService,
    PdfTemplateEngineService,
  ],
})
export class PdfGeneratorModule {}
