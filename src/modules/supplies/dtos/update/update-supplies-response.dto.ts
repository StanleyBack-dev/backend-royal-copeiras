import { Field, Float, ObjectType } from "@nestjs/graphql";
import { ISupply } from "../../interface/supply.interface";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";

@ObjectType()
export class UpdateSuppliesResponseDto implements Omit<
  ISupply,
  "normalizedName"
> {
  static fromEntity(
    entity: import("../../entities/supplies.entity").SuppliesEntity,
  ): UpdateSuppliesResponseDto {
    const dto = new UpdateSuppliesResponseDto();
    dto.idSupplies = entity.idSupplies;
    dto.name = entity.name;
    dto.defaultUnit = entity.defaultUnit ?? null;
    dto.suggestedUnitPrice = entity.suggestedUnitPrice ?? null;
    dto.isActive = entity.isActive;
    dto.createdAt =
      entity.createdAt instanceof Date
        ? formatLocalDateTime(entity.createdAt) || String(entity.createdAt)
        : String(entity.createdAt);
    dto.updatedAt =
      entity.updatedAt instanceof Date
        ? formatLocalDateTime(entity.updatedAt) || String(entity.updatedAt)
        : String(entity.updatedAt);
    return dto;
  }

  @Field()
  idSupplies!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  defaultUnit?: string | null;

  @Field(() => Float, { nullable: true })
  suggestedUnitPrice?: number | null;

  @Field()
  isActive!: boolean;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
