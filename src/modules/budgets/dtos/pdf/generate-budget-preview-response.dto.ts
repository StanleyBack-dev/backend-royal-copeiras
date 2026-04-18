import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class GenerateBudgetPreviewResponseDto {
  @Field()
  fileName!: string;

  @Field()
  mimeType!: string;

  @Field()
  base64Content!: string;

  @Field()
  snapshotHash!: string;
}
