import { Field, ObjectType } from "@nestjs/graphql";
import { SignatureStatus } from "../enums/signature-status.enum";
import { SignatureEntity } from "../entities/signature.entity";

@ObjectType()
export class GetSignaturesResponseDto {
  static fromEntity(entity: SignatureEntity): GetSignaturesResponseDto {
    const dto = new GetSignaturesResponseDto();
    dto.idSignatures = entity.idSignatures;
    dto.idContracts = entity.idContracts;
    dto.contractNumber = entity.contract?.contractNumber;
    dto.contractStatus = entity.contract?.status;
    dto.provider = entity.provider;
    dto.envelopeId = entity.envelopeId;
    dto.status = entity.status;
    dto.signedByName = entity.signedByName;
    dto.signedByEmail = entity.signedByEmail;
    dto.signedByDocument = entity.signedByDocument;
    dto.signerIp = entity.signerIp;
    dto.signedAt = entity.signedAt ? entity.signedAt.toISOString() : undefined;
    dto.signatureUrl = entity.signatureUrl;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }

  @Field()
  idSignatures!: string;

  @Field()
  idContracts!: string;

  @Field({ nullable: true })
  contractNumber?: string;

  @Field({ nullable: true })
  contractStatus?: string;

  @Field()
  provider!: string;

  @Field()
  envelopeId!: string;

  @Field(() => SignatureStatus)
  status!: SignatureStatus;

  @Field({ nullable: true })
  signedByName?: string;

  @Field({ nullable: true })
  signedByEmail?: string;

  @Field({ nullable: true })
  signedByDocument?: string;

  @Field({ nullable: true })
  signerIp?: string;

  @Field({ nullable: true })
  signedAt?: string;

  @Field({ nullable: true })
  signatureUrl?: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
