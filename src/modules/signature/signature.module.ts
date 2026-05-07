import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { SIGNATURE_PROVIDER_TOKEN } from "./contracts/signature.tokens";
import { AssinafySignatureProvider } from "./providers/assinafy-signature.provider";
import { SignatureResolver } from "./resolvers/signature.resolver";
import { CancelSignatureRequestService } from "./services/cancel-signature-request.service";
import { CreateSignatureRequestService } from "./services/create-signature-request.service";
import { GetSignatureStatusService } from "./services/get-signature-status.service";
import { GetSignaturesService } from "./services/get-signatures.service";
import { SignatureEntity } from "./entities/signature.entity";
import { ContractsEntity } from "../contracts/entities/contracts.entity";
import { UserEntity } from "../users/entities/user.entity";
import { LeadsEntity } from "../leads/entities/leads.entity";
import { LeadsModule } from "../leads/leads.module";
import { ProcessSignatureCallbackService } from "./services/process-signature-callback.service";
import { AssinafyWebhookController } from "./controllers/assinafy-webhook.controller";
import { ProcessSignatureWebhookService } from "./services/process-signature-webhook.service";
import { SignatureWebhookController } from "./controllers/signature-webhook.controller";
import { CustomersModule } from "../customers/customers.module";
import { EventsModule } from "../events/events.module";
import { ActivateSignedContractService } from "./services/activate-signed-contract.service";

@Module({
  imports: [
    AuthModule,
    LeadsModule,
    CustomersModule,
    EventsModule,
    TypeOrmModule.forFeature([
      SignatureEntity,
      ContractsEntity,
      UserEntity,
      LeadsEntity,
    ]),
  ],
  controllers: [AssinafyWebhookController, SignatureWebhookController],
  providers: [
    SignatureResolver,
    CreateSignatureRequestService,
    GetSignatureStatusService,
    CancelSignatureRequestService,
    GetSignaturesService,
    ProcessSignatureCallbackService,
    ProcessSignatureWebhookService,
    ActivateSignedContractService,
    {
      provide: SIGNATURE_PROVIDER_TOKEN,
      useClass: AssinafySignatureProvider,
    },
  ],
  exports: [
    CreateSignatureRequestService,
    GetSignatureStatusService,
    CancelSignatureRequestService,
    GetSignaturesService,
    ActivateSignedContractService,
  ],
})
export class SignatureModule {}
