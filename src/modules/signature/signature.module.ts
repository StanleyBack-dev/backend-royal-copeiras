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

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([SignatureEntity])],
  providers: [
    SignatureResolver,
    CreateSignatureRequestService,
    GetSignatureStatusService,
    CancelSignatureRequestService,
    GetSignaturesService,
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
  ],
})
export class SignatureModule {}
