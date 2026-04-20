import { Injectable } from "@nestjs/common";
import { PdfTemplateKey } from "../../../pdf-generator/enums/pdf-template-key.enum";
import { PdfTemplateEngineService } from "../../../pdf-generator/services/pdf-template-engine.service";
import { PdfSnapshotHashService } from "../../../pdf-generator/services/pdf-snapshot-hash.service";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { BudgetPdfSnapshot } from "../../interfaces/budget-pdf-snapshot.interface";
import { BuildBudgetPdfSnapshotService } from "./build-budget-pdf-snapshot.service";
import { BuildBudgetProposalPdfPayloadService } from "./build-budget-proposal-pdf-payload.service";

export interface GeneratedBudgetProposalPdfDocument {
  snapshot: BudgetPdfSnapshot;
  snapshotHash: string;
  pdfBuffer: Buffer;
}

@Injectable()
export class GenerateBudgetProposalPdfDocumentService {
  constructor(
    private readonly buildBudgetPdfSnapshotService: BuildBudgetPdfSnapshotService,
    private readonly buildBudgetProposalPdfPayloadService: BuildBudgetProposalPdfPayloadService,
    private readonly pdfSnapshotHashService: PdfSnapshotHashService,
    private readonly pdfTemplateEngineService: PdfTemplateEngineService,
  ) {}

  async generateFromBudget(
    budget: BudgetsEntity,
  ): Promise<GeneratedBudgetProposalPdfDocument> {
    const snapshot = this.buildBudgetPdfSnapshotService.buildFromEntity(budget);
    const snapshotHash = this.pdfSnapshotHashService.hashSnapshot(snapshot);
    const payload = this.buildBudgetProposalPdfPayloadService.build(
      snapshot,
      snapshotHash,
    );
    const pdfBuffer = await this.pdfTemplateEngineService.generateByTemplate({
      templateKey: PdfTemplateKey.BUDGETS,
      payload,
    });

    return {
      snapshot,
      snapshotHash,
      pdfBuffer,
    };
  }
}
