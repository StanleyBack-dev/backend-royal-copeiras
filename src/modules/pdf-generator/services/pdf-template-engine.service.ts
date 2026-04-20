import { Injectable } from "@nestjs/common";
import { AppException } from "../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../common/exceptions/app-errors.catalog";
import { PdfTemplateKey } from "../enums/pdf-template-key.enum";
import { PdfTemplateRenderer } from "../interfaces/pdf-template-renderer.interface";
import { RenderBudgetProposalTemplateService } from "../templates/budgets/render-budget-proposal-template.service";
import { RenderContractTemplateService } from "../templates/contracts/render-contract-template.service";

interface GenerateByTemplateInput<TPayload> {
  templateKey: PdfTemplateKey;
  payload: TPayload;
}

@Injectable()
export class PdfTemplateEngineService {
  private readonly registry: Map<PdfTemplateKey, PdfTemplateRenderer>;

  constructor(
    private readonly renderBudgetProposalTemplateService: RenderBudgetProposalTemplateService,
    private readonly renderContractTemplateService: RenderContractTemplateService,
  ) {
    this.registry = new Map<PdfTemplateKey, PdfTemplateRenderer>([
      [
        this.renderBudgetProposalTemplateService.templateKey,
        this.renderBudgetProposalTemplateService,
      ],
      [
        this.renderContractTemplateService.templateKey,
        this.renderContractTemplateService,
      ],
    ]);
  }

  async generateByTemplate<TPayload>(
    input: GenerateByTemplateInput<TPayload>,
  ): Promise<Buffer> {
    const renderer = this.registry.get(input.templateKey);

    if (!renderer) {
      throw AppException.from(APP_ERRORS.pdf.templateNotMapped, undefined);
    }

    return renderer.render(input.payload);
  }
}
