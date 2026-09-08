import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { BudgetItemsEntity } from "../../../budgets/entities/budget-items.entity";

@ObjectType()
export class GetEventServiceLineResponseDto {
  static fromEntity(entity: BudgetItemsEntity): GetEventServiceLineResponseDto {
    const dto = new GetEventServiceLineResponseDto();
    dto.idBudgetItems = entity.idBudgetItems;
    dto.serviceDescription = entity.description;
    dto.quantity = entity.quantity;
    dto.unitPrice = Number(entity.unitPrice ?? 0);
    dto.totalPrice = Number(entity.totalPrice ?? 0);
    dto.sortOrder = entity.sortOrder;
    dto.eventDateIndex = entity.eventDateIndex ?? 0;
    return dto;
  }

  @Field()
  idBudgetItems!: string;

  @Field()
  serviceDescription!: string;

  @Field()
  quantity!: number;

  @Field(() => Float)
  unitPrice!: number;

  @Field(() => Float)
  totalPrice!: number;

  @Field()
  sortOrder!: number;

  @Field(() => Int)
  eventDateIndex!: number;
}
