import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DownloadBudgetPdfResponseDto {
  @Field()
  fileName!: string;

  @Field()
  mimeType!: string;

  @Field()
  base64Content!: string;

  @Field()
  snapshotHash!: string;

  @Field()
  frozenAt!: string;
}
