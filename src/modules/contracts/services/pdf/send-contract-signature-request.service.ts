import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { CreateSignatureRequestService } from "../../../signature/services/create-signature-request.service";
import { ContractsEntity } from "../../entities/contracts.entity";
import { ContractStatus } from "../../enums/contract-status.enum";
import { buildContractPdfFileName } from "../../utils/build-contract-pdf-file-name.util";
import { GenerateContractProposalPdfDocumentService } from "./generate-contract-proposal-pdf-document.service";

export interface SendContractSignatureRequestInput {
  idContracts: string;
}

@Injectable()
export class SendContractSignatureRequestService {
  constructor(
    @InjectRepository(ContractsEntity)
    private readonly contractsRepository: Repository<ContractsEntity>,
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    private readonly authorizationService: AuthorizationService,
    private readonly configService: ConfigService,
    private readonly createSignatureRequestService: CreateSignatureRequestService,
    private readonly generateContractProposalPdfDocumentService: GenerateContractProposalPdfDocumentService,
  ) {}

  async execute(
    userId: string,
    input: SendContractSignatureRequestInput,
  ): Promise<void> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const contract = await this.contractsRepository.findOne({
      where: { idContracts: input.idContracts },
      relations: { lead: true },
    });

    if (!contract) {
      throw AppException.from(APP_ERRORS.contracts.notFound, undefined);
    }

    if (!contract.idLeads) {
      throw AppException.from(APP_ERRORS.budgets.leadRequired, undefined);
    }

    if (
      ![ContractStatus.GENERATED, ContractStatus.PENDING_SIGNATURE].includes(
        contract.status,
      )
    ) {
      throw AppException.from(
        APP_ERRORS.contracts.invalidStatusTransition,
        undefined,
      );
    }

    const lead =
      contract.lead ||
      (await this.leadsRepository.findOne({
        where: { idLeads: contract.idLeads },
      }));

    if (!lead) {
      throw AppException.from(APP_ERRORS.leads.notFound, undefined);
    }

    if (!lead.email) {
      throw AppException.from(APP_ERRORS.contracts.leadHasNoEmail, undefined);
    }

    const document =
      await this.generateContractProposalPdfDocumentService.generateFromContract(
        contract,
      );
    const signatureRequest = await this.createSignatureRequestService.execute({
      documentName: buildContractPdfFileName({
        contractNumber: contract.contractNumber,
        issueDate: contract.issueDate,
      }),
      documentBase64: document.pdfBuffer.toString("base64"),
      externalReference: contract.idContracts,
      signers: [
        {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          identifier: lead.document,
        },
        {
          name:
            this.configService.get<string>("CONTRACT_COMPANY_SIGNER_NAME") ||
            this.configService.get<string>("MAIL_FROM_NAME") ||
            "Royal Copeiras",
          email:
            this.configService.get<string>("CONTRACT_COMPANY_SIGNER_EMAIL") ||
            this.configService.get<string>("MAIL_FROM_EMAIL") ||
            "no-reply@royalcopeiras.com.br",
          phone: this.configService.get<string>(
            "CONTRACT_COMPANY_SIGNER_PHONE",
          ),
          identifier: this.configService.get<string>(
            "CONTRACT_COMPANY_SIGNER_IDENTIFIER",
          ),
        },
      ],
    });

    if (!signatureRequest.signatureUrl) {
      throw AppException.from(
        APP_ERRORS.signatures.providerRequestFailed,
        undefined,
      );
    }

    await this.contractsRepository.update(contract.idContracts, {
      status: ContractStatus.PENDING_SIGNATURE,
      sentVia: "signature_provider",
      sentAt: new Date(),
      contractSnapshot: {
        ...(contract.contractSnapshot ?? {}),
        signature: {
          requestId: signatureRequest.requestId,
          status: signatureRequest.providerRawStatus,
          signatureUrl: signatureRequest.signatureUrl,
        },
      },
    });
  }
}
