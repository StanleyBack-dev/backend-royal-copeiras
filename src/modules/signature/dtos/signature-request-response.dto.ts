import { Field, ObjectType } from "@nestjs/graphql";
import { SignatureStatus } from "../enums/signature-status.enum";

@ObjectType()
export class SignatureRequestResponseDto {
  @Field()
  requestId!: string;

  @Field(() => SignatureStatus)
  status!: SignatureStatus;

  @Field()
  providerRawStatus!: string;

  @Field({ nullable: true })
  signatureUrl?: string;

  @Field({ nullable: true })
  completedAt?: string;
}
