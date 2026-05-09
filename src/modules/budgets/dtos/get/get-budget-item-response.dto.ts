import { Field, Float, ObjectType } from "@nestjs/graphql";
import { IBudgetItem } from "../../interface/budget-item.interface";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";

@ObjectType()
export class GetBudgetItemResponseDto implements IBudgetItem {
  static fromEntity(
    entity: import("../../entities/budgetItems.entity").BudgetItemsEntity,
  ): GetBudgetItemResponseDto {
    const dto = new GetBudgetItemResponseDto();
    dto.idBudgetItems = entity.idBudgetItems;
    dto.idPositions = entity.idPositions;
    dto.position = entity.position?.name || null;
    dto.description = entity.description;
    dto.quantity = entity.quantity;
    dto.unitPrice = entity.unitPrice;
    dto.totalPrice = entity.totalPrice;
    dto.notes = entity.notes;
    dto.sortOrder = entity.sortOrder;
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
  idBudgetItems!: string;

  @Field(() => String, { nullable: true })
  idPositions?: string | null;

  @Field(() => String, { nullable: true })
  position?: string | null;

  @Field()
  description!: string;

  @Field()
  quantity!: number;

  @Field(() => Float)
  unitPrice!: number;

  @Field(() => Float)
  totalPrice!: number;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  sortOrder!: number;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
