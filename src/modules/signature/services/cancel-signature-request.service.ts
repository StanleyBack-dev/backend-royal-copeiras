import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { ISignatureProvider } from "../contracts/signature-provider.contract";
import { SIGNATURE_PROVIDER_TOKEN } from "../contracts/signature.tokens";
import { SignatureEntity } from "../entities/signature.entity";
import { SignatureStatus } from "../enums/signature-status.enum";

@Injectable()
export class CancelSignatureRequestService {
  constructor(
    @Inject(SIGNATURE_PROVIDER_TOKEN)
    private readonly signatureProvider: ISignatureProvider,
    @InjectRepository(SignatureEntity)
    private readonly signaturesRepository: Repository<SignatureEntity>,
  ) {}

  async execute(requestId: string): Promise<void> {
    await this.signatureProvider.cancelRequest(requestId);

    const existing = await this.signaturesRepository.findOne({
      where: { envelopeId: requestId },
    });
    if (existing) {
      existing.status = SignatureStatus.CANCELLED;
      await this.signaturesRepository.save(existing);
    }
  }
}
