import { Injectable } from "@nestjs/common";
import { PdfTemplateKey } from "../../../pdf-generator/enums/pdf-template-key.enum";
import { PdfTemplateEngineService } from "../../../pdf-generator/services/pdf-template-engine.service";
import { PdfSnapshotHashService } from "../../../pdf-generator/services/pdf-snapshot-hash.service";
import { ContractsEntity } from "../../entities/contracts.entity";
import { ContractPdfSnapshot } from "../../interfaces/contract-pdf-snapshot.interface";
import { BuildContractPdfSnapshotService } from "./build-contract-pdf-snapshot.service";
import { BuildContractProposalPdfPayloadService } from "./build-contract-proposal-pdf-payload.service";

export interface GeneratedContractProposalPdfDocument {
  snapshot: ContractPdfSnapshot;
  snapshotHash: string;
  pdfBuffer: Buffer;
}

@Injectable()
export class GenerateContractProposalPdfDocumentService {
  constructor(
    private readonly buildContractPdfSnapshotService: BuildContractPdfSnapshotService,
    private readonly buildContractProposalPdfPayloadService: BuildContractProposalPdfPayloadService,
    private readonly pdfSnapshotHashService: PdfSnapshotHashService,
    private readonly pdfTemplateEngineService: PdfTemplateEngineService,
  ) {}

  async generateFromContract(
    contract: ContractsEntity,
  ): Promise<GeneratedContractProposalPdfDocument> {
    const snapshot =
      this.buildContractPdfSnapshotService.buildFromEntity(contract);
    const snapshotHash = this.pdfSnapshotHashService.hashSnapshot(snapshot);
    const payload = this.buildContractProposalPdfPayloadService.build(
      snapshot,
      snapshotHash,
    );
    const pdfBuffer = await this.pdfTemplateEngineService.generateByTemplate({
      templateKey: PdfTemplateKey.CONTRACTS,
      payload,
    });

    return {
      snapshot,
      snapshotHash,
      pdfBuffer,
    };
  }
}
