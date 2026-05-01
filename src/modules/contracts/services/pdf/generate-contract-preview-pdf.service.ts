import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { GenerateContractPreviewInputDto } from "../../dtos/pdf/generate-contract-preview-input.dto";
import { ContractsEntity } from "../../entities/contracts.entity";
import { buildContractPdfFileName } from "../../utils/build-contract-pdf-file-name.util";
import { GenerateContractProposalPdfDocumentService } from "./generate-contract-proposal-pdf-document.service";

@Injectable()
export class GenerateContractPreviewPdfService {
  constructor(
    @InjectRepository(ContractsEntity)
    private readonly contractsRepository: Repository<ContractsEntity>,
    private readonly authorizationService: AuthorizationService,
    private readonly generateContractProposalPdfDocumentService: GenerateContractProposalPdfDocumentService,
  ) {}

  async execute(userId: string, input: GenerateContractPreviewInputDto) {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const contract = await this.contractsRepository.findOne({
      where: { idContracts: input.idContracts },
      relations: { budget: true, lead: true },
    });

    if (!contract) {
      throw AppException.from(APP_ERRORS.contracts.notFound, undefined);
    }

    const document =
      await this.generateContractProposalPdfDocumentService.generateFromContract(
        contract,
      );

    return {
      fileName: buildContractPdfFileName({
        contractNumber: contract.contractNumber,
        issueDate: contract.issueDate,
      }),
      mimeType: "application/pdf",
      base64Content: document.pdfBuffer.toString("base64"),
      snapshotHash: document.snapshotHash,
    };
  }
}
