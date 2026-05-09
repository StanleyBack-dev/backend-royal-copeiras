import { Field, ObjectType } from "@nestjs/graphql";
import { IPosition } from "../../interface/position.interface";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";

@ObjectType()
export class GetPositionsResponseDto implements Omit<
  IPosition,
  "normalizedName"
> {
  static fromEntity(
    entity: import("../../entities/positions.entity").PositionsEntity,
  ): GetPositionsResponseDto {
    const dto = new GetPositionsResponseDto();
    dto.idPositions = entity.idPositions;
    dto.name = entity.name;
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
  idPositions!: string;

  @Field()
  name!: string;

  @Field()
  isActive!: boolean;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
