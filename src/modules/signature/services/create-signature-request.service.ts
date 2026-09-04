import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { ISignatureProvider } from "../contracts/signature-provider.contract";
import { SIGNATURE_PROVIDER_TOKEN } from "../contracts/signature.tokens";
import { CreateSignatureRequestInputDto } from "../dtos/create-signature-request-input.dto";
import { SignatureRequestResponseDto } from "../dtos/signature-request-response.dto";
import { SignatureEntity } from "../entities/signature.entity";
import { SignatureStatus } from "../enums/signature-status.enum";
import { SignerType } from "../enums/signer-type.enum";

@Injectable()
export class CreateSignatureRequestService {
  private readonly logger = new Logger(CreateSignatureRequestService.name);

  constructor(
    @Inject(SIGNATURE_PROVIDER_TOKEN)
    private readonly signatureProvider: ISignatureProvider,
    @InjectRepository(SignatureEntity)
    private readonly signaturesRepository: Repository<SignatureEntity>,
  ) {}

  async execute(
    input: CreateSignatureRequestInputDto,
  ): Promise<SignatureRequestResponseDto> {
    const idContracts = input.externalReference;

    // A slow provider call can outlast the caller's timeout, which retries
    // (or the user clicks again) while the first request is still in
    // flight or already succeeded. Calling the provider again would create
    // a second, distinct envelope — a real duplicate signature request
    // e-mailed to the client. If an envelope is already active for this
    // contract, reuse it instead of calling the provider again.
    if (idContracts) {
      const existingActive = await this.signaturesRepository.find({
        where: { idContracts, status: SignatureStatus.PENDING },
        order: { signerIndex: "ASC" },
      });

      if (existingActive.length > 0) {
        this.logger.warn(
          `Skipping duplicate signature request for contract ${idContracts}: ` +
            `an active envelope already exists (envelopeId=${existingActive[0].envelopeId}).`,
        );

        const clientSigner =
          existingActive.find((e) => e.signerType === SignerType.CLIENT) ??
          existingActive[0];

        return {
          requestId: existingActive[0].envelopeId,
          status: existingActive[0].status,
          providerRawStatus: existingActive[0].status,
          signatureUrl: clientSigner.signatureUrl,
        };
      }
    }

    const response = await this.signatureProvider.createRequest(input);
    if (idContracts) {
      const signingUrls = response.signingUrls ?? [];
      const signers = input.signers ?? [];

      // avoid creating duplicate signature rows if a previous request already
      // created them for the same contract + envelopeId (idempotency guard)
      const existing = await this.signaturesRepository.find({
        where: { idContracts, envelopeId: response.requestId },
      });

      const entitiesToCreate: SignatureEntity[] = [];

      for (let i = 0; i < signers.length; i += 1) {
        const s = signers[i];
        const assign = signingUrls[i] ?? undefined;

        const alreadyExists = existing.some((e) => {
          if (assign?.signerId && e.providerSignerId === assign.signerId)
            return true;
          if (
            s?.email &&
            e.signedByEmail &&
            e.signedByEmail.toLowerCase() === s.email.toLowerCase()
          )
            return true;
          if (typeof e.signerIndex === "number" && e.signerIndex === i)
            return true;
          return false;
        });

        if (alreadyExists) continue;

        // Determine signer type: index 0 = CLIENT, index 1 = COMPANY
        let signerType = SignerType.OTHER;
        if (i === 0) {
          signerType = SignerType.CLIENT;
        } else if (i === 1) {
          signerType = SignerType.COMPANY;
        }

        // TEMP DIAGNOSTIC LOGGING — investigating signed_by_document ending up
        // swapped between CLIENT/COMPANY rows in production. Masks the
        // document value (keeps only its length and last 2 chars) so real
        // CPF/CNPJ numbers never land in logs. Remove once root-caused.
        this.logger.debug(
          `signer[${i}] type=${signerType} name=${s?.name} email=${s?.email} ` +
            `identifierLen=${s?.identifier?.length ?? 0} identifierTail=${
              s?.identifier ? s.identifier.slice(-2) : "-"
            }`,
        );

        entitiesToCreate.push(
          this.signaturesRepository.create({
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
            signerType,
          }),
        );
      }

      if (entitiesToCreate.length > 0) {
        await this.signaturesRepository.save(entitiesToCreate);
      }
    }

    return { ...response };
  }
}
