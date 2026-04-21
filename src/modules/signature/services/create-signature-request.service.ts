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
      await this.signaturesRepository.save(
        this.signaturesRepository.create({
          idContracts,
          provider: "assinafy",
          envelopeId: response.requestId,
          status: response.status,
          signatureUrl: response.signatureUrl,
          signedByName: input.signers?.[0]?.name,
          signedByEmail: input.signers?.[0]?.email,
          signedByDocument: input.signers?.[0]?.identifier,
        }),
      );
    }

    return { ...response };
  }
}
