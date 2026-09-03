import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { CompanyProfileModule } from "../company-profile/company-profile.module";
import { BudgetsEntity } from "../budgets/entities/budgets.entity";
import { LeadsEntity } from "../leads/entities/leads.entity";
import { MailModule } from "../mails/mail.module";
import { PdfGeneratorModule } from "../pdf-generator/pdf-generator.module";
import { SignatureModule } from "../signature/signature.module";
import { ContractsEntity } from "./entities/contracts.entity";
import { CreateContractsService } from "./services/create/create-contracts.service";
import { GetContractsService } from "./services/get/get-contracts.service";
import { UpdateContractsService } from "./services/update/update-contracts.service";
import { CreateContractsResolver } from "./resolvers/create/create-contracts.resolver";
import { GetContractsResolver } from "./resolvers/get/get-contracts.resolver";
import { UpdateContractsResolver } from "./resolvers/update/update-contracts.resolver";
import { BuildContractPdfSnapshotService } from "./services/pdf/build-contract-pdf-snapshot.service";
import { BuildContractProposalPdfPayloadService } from "./services/pdf/build-contract-proposal-pdf-payload.service";
import { GenerateContractProposalPdfDocumentService } from "./services/pdf/generate-contract-proposal-pdf-document.service";
import { GenerateContractPreviewPdfService } from "./services/pdf/generate-contract-preview-pdf.service";
import { GenerateContractPreviewResolver } from "./resolvers/pdf/generate-contract-preview.resolver";
import { SendContractEmailService } from "./services/pdf/send-contract-email.service";
import { SendContractEmailResolver } from "./resolvers/pdf/send-contract-email.resolver";
import { SendContractSignatureRequestService } from "./services/pdf/send-contract-signature-request.service";
import { SendContractSignatureRequestResolver } from "./resolvers/pdf/send-contract-signature-request.resolver";
import { CloseContractWithoutSignatureService } from "./services/pdf/close-contract-without-signature.service";
import { CloseContractWithoutSignatureResolver } from "./resolvers/pdf/close-contract-without-signature.resolver";
import { PaymentsModule } from "../payments/payments.module";

@Module({
  imports: [
    AuthModule,
    CompanyProfileModule,
    MailModule,
    PdfGeneratorModule,
    SignatureModule,
    PaymentsModule,
    TypeOrmModule.forFeature([ContractsEntity, BudgetsEntity, LeadsEntity]),
  ],
  providers: [
    CreateContractsService,
    CreateContractsResolver,
    GetContractsService,
    GetContractsResolver,
    UpdateContractsService,
    UpdateContractsResolver,
    BuildContractPdfSnapshotService,
    BuildContractProposalPdfPayloadService,
    GenerateContractProposalPdfDocumentService,
    GenerateContractPreviewPdfService,
    GenerateContractPreviewResolver,
    SendContractEmailService,
    SendContractEmailResolver,
    SendContractSignatureRequestService,
    SendContractSignatureRequestResolver,
    CloseContractWithoutSignatureService,
    CloseContractWithoutSignatureResolver,
  ],
  exports: [
    CreateContractsService,
    GetContractsService,
    UpdateContractsService,
    GenerateContractProposalPdfDocumentService,
  ],
})
export class ContractsModule {}
