import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { ISignatureProvider } from "../contracts/signature-provider.contract";
import { SIGNATURE_PROVIDER_TOKEN } from "../contracts/signature.tokens";
import { SignatureRequestResponseDto } from "../dtos/signature-request-response.dto";
import { SignatureEntity } from "../entities/signature.entity";

@Injectable()
export class GetSignatureStatusService {
  constructor(
    @Inject(SIGNATURE_PROVIDER_TOKEN)
    private readonly signatureProvider: ISignatureProvider,
    @InjectRepository(SignatureEntity)
    private readonly signaturesRepository: Repository<SignatureEntity>,
  ) {}

  async execute(requestId: string): Promise<SignatureRequestResponseDto> {
    const response = await this.signatureProvider.getRequestStatus(requestId);
    const existing = await this.signaturesRepository.find({
      where: { envelopeId: requestId },
    });

    if (existing && existing.length > 0) {
      const updated = existing.map((e) => {
        e.status = response.status;
        e.signatureUrl = response.signatureUrl ?? e.signatureUrl;
        e.signedAt = response.completedAt
          ? new Date(response.completedAt)
          : e.signedAt;
        return e;
      });
      await this.signaturesRepository.save(updated);
    }

    return { ...response };
  }
}
