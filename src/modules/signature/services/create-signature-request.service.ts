import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { ISignatureProvider } from "../contracts/signature-provider.contract";
import { SIGNATURE_PROVIDER_TOKEN } from "../contracts/signature.tokens";
import { CreateSignatureRequestInputDto } from "../dtos/create-signature-request-input.dto";
import { SignatureRequestResponseDto } from "../dtos/signature-request-response.dto";
import { SignatureEntity } from "../entities/signature.entity";

@Injectable()
export class CreateSignatureRequestService {
  constructor(
    @Inject(SIGNATURE_PROVIDER_TOKEN)
    private readonly signatureProvider: ISignatureProvider,
    @InjectRepository(SignatureEntity)
    private readonly signaturesRepository: Repository<SignatureEntity>,
  ) {}

  async execute(
    input: CreateSignatureRequestInputDto,
  ): Promise<SignatureRequestResponseDto> {
    const response = await this.signatureProvider.createRequest(input);
    const idContracts = input.externalReference;

    if (idContracts) {
      const signingUrls = response.signingUrls ?? [];
      const signers = input.signers ?? [];
      const entities = signers.map((s, i) => {
        const assign = signingUrls[i] ?? undefined;
        return this.signaturesRepository.create({
          idContracts,
          provider: "assinafy",
          envelopeId: response.requestId,
          status: response.status,
          signatureUrl:
            assign?.url ?? (i === 0 ? response.signatureUrl : undefined),
          signedByName: s?.name,
          signedByEmail: s?.email,
          signedByDocument: s?.identifier,
          providerSignerId: assign?.signerId,
          signerIndex: i,
        });
      });

      if (entities.length > 0) {
        await this.signaturesRepository.save(entities);
      }
    }

    return { ...response };
  }
}
