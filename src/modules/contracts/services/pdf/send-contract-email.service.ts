import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import type { IMailProvider } from "../../../mails/contracts/mail-provider.contract";
import { MAIL_PROVIDER_TOKEN } from "../../../mails/contracts/mail.tokens";
import { buildContractProposalEmail } from "../../../mails/templates/contracts/contract-proposal-email.template";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { ContractsEntity } from "../../entities/contracts.entity";
import { ContractStatus } from "../../enums/contract-status.enum";
import { buildContractPdfFileName } from "../../utils/build-contract-pdf-file-name.util";
import { GenerateContractProposalPdfDocumentService } from "./generate-contract-proposal-pdf-document.service";

export interface SendContractEmailInput {
  idContracts: string;
}

@Injectable()
export class SendContractEmailService {
  private readonly logger = new Logger(SendContractEmailService.name);

  constructor(
    @InjectRepository(ContractsEntity)
    private readonly contractsRepository: Repository<ContractsEntity>,
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    private readonly authorizationService: AuthorizationService,
    @Inject(MAIL_PROVIDER_TOKEN)
    private readonly mailProvider: IMailProvider,
    private readonly configService: ConfigService,
    private readonly generateContractProposalPdfDocumentService: GenerateContractProposalPdfDocumentService,
  ) {}

  async execute(userId: string, input: SendContractEmailInput): Promise<void> {
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

    try {
      const document =
        await this.generateContractProposalPdfDocumentService.generateFromContract(
          contract,
        );
      const template = buildContractProposalEmail({
        leadName: lead.name,
        contractNumber: contract.contractNumber,
        budgetNumber: contract.budgetNumber,
        issueDate:
          contract.issueDate instanceof Date
            ? contract.issueDate.toISOString()
            : String(contract.issueDate),
        validUntil:
          contract.validUntil instanceof Date
            ? contract.validUntil.toISOString()
            : contract.validUntil
              ? String(contract.validUntil)
              : undefined,
        displacementFee: contract.budget?.displacementFee,
        totalAmount: contract.budget?.totalAmount,
      });

      await this.mailProvider.send({
        to: { email: lead.email, name: lead.name },
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: this.buildReplyTo(),
        attachments: [
          {
            name: buildContractPdfFileName({
              contractNumber: contract.contractNumber,
              issueDate: contract.issueDate,
            }),
            content: document.pdfBuffer.toString("base64"),
            type: "application/pdf",
          },
        ],
      });

      await this.contractsRepository.update(contract.idContracts, {
        sentVia: "email_preview",
        sentAt: new Date(),
      });
    } catch (error) {
      if (error instanceof AppException) {
        const response = error.getResponse();
        this.logger.warn("Falha ao enviar contrato por e-mail (AppException)", {
          idContracts: contract.idContracts,
          response,
        });
        throw error;
      }

      this.logger.error(
        "Falha ao enviar contrato por e-mail (erro inesperado)",
        {
          idContracts: contract.idContracts,
          message: (error as Error | undefined)?.message,
        },
      );

      throw AppException.from(APP_ERRORS.contracts.emailSendFailed, undefined);
    }
  }

  private buildReplyTo() {
    const replyToEmail = this.configService.get<string>("MAIL_REPLY_TO_EMAIL");
    if (!replyToEmail) {
      return undefined;
    }

    return {
      email: replyToEmail,
      name:
        this.configService.get<string>("MAIL_REPLY_TO_NAME") ||
        this.configService.get<string>("MAIL_FROM_NAME") ||
        "Royal Copeiras",
    };
  }
}
