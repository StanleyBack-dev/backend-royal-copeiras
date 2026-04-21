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
    const existing = await this.signaturesRepository.findOne({
      where: { envelopeId: requestId },
    });

    if (existing) {
      existing.status = response.status;
      existing.signatureUrl = response.signatureUrl;
      existing.signedAt = response.completedAt
        ? new Date(response.completedAt)
        : existing.signedAt;
      await this.signaturesRepository.save(existing);
    }

    return { ...response };
  }
}
