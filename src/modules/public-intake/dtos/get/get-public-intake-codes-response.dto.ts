import { Field, ObjectType } from "@nestjs/graphql";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";
import { PublicIntakeCodeEntity } from "../../entities/public-intake-code.entity";
import { PublicIntakeCodeStatus } from "../../enums/public-intake-code-status.enum";
import { derivePublicIntakeCodeStatus } from "../../utils/derive-public-intake-code-status.util";

function formatDate(value: Date | string): string {
  return value instanceof Date
    ? formatLocalDateTime(value) || String(value)
    : String(value);
}

@ObjectType()
export class GetPublicIntakeCodesResponseDto {
  static fromEntity(
    entity: PublicIntakeCodeEntity,
  ): GetPublicIntakeCodesResponseDto {
    const dto = new GetPublicIntakeCodesResponseDto();
    dto.idPublicIntakeCodes = entity.idPublicIntakeCodes;
    dto.code = entity.code;
    dto.status = derivePublicIntakeCodeStatus(entity);
    dto.expiresAt = formatDate(entity.expiresAt);
    dto.resultingLeadId = entity.resultingLeadId ?? undefined;
    dto.resultingBudgetId = entity.resultingBudgetId ?? undefined;
    dto.createdAt = formatDate(entity.createdAt);
    return dto;
  }

  @Field()
  idPublicIntakeCodes!: string;

  @Field()
  code!: string;

  @Field(() => PublicIntakeCodeStatus)
  status!: PublicIntakeCodeStatus;

  @Field()
  expiresAt!: string;

  @Field({ nullable: true })
  resultingLeadId?: string;

  @Field({ nullable: true })
  resultingBudgetId?: string;

  @Field()
  createdAt!: string;
}
