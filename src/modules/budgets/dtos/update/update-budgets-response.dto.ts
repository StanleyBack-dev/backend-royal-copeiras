import { Field, Float, ObjectType } from "@nestjs/graphql";
import { BudgetStatus } from "../../enums/budget-status.enum";
import { IBudget } from "../../interface/budget.interface";

@ObjectType()
class UpdateBudgetItemResponseDto {
  @Field()
  idBudgetItems!: string;

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

@ObjectType()
export class UpdateBudgetsResponseDto implements IBudget {
  static fromEntity(
    entity: import("../../entities/budgets.entity").BudgetsEntity,
  ): UpdateBudgetsResponseDto {
    const dto = new UpdateBudgetsResponseDto();
    dto.idBudgets = entity.idBudgets;
    dto.idLeads = entity.idLeads;
    dto.budgetNumber = entity.budgetNumber;
    dto.status = entity.status;
    dto.issueDate =
      entity.issueDate instanceof Date
        ? entity.issueDate.toISOString()
        : String(entity.issueDate);
    dto.validUntil =
      entity.validUntil instanceof Date
        ? entity.validUntil.toISOString()
        : String(entity.validUntil);
    dto.eventDates = entity.eventDates ?? [];
    dto.eventLocation = entity.eventLocation;
    dto.guestCount = entity.guestCount;
    dto.durationHours = entity.durationHours;
    dto.paymentMethod = entity.paymentMethod;
    dto.advancePercentage = entity.advancePercentage;
    dto.subtotal = entity.subtotal;
    dto.totalAmount = entity.totalAmount;
    dto.sentVia = entity.sentVia;
    dto.sentAt =
      entity.sentAt instanceof Date
        ? entity.sentAt.toISOString()
        : entity.sentAt
          ? String(entity.sentAt)
          : undefined;
    dto.items = (entity.items ?? []).map((item) => ({
      idBudgetItems: item.idBudgetItems,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      notes: item.notes,
      sortOrder: item.sortOrder,
      createdAt:
        item.createdAt instanceof Date
          ? item.createdAt.toISOString()
          : String(item.createdAt),
      updatedAt:
        item.updatedAt instanceof Date
          ? item.updatedAt.toISOString()
          : String(item.updatedAt),
    }));
    dto.createdAt =
      entity.createdAt instanceof Date
        ? entity.createdAt.toISOString()
        : String(entity.createdAt);
    dto.updatedAt =
      entity.updatedAt instanceof Date
        ? entity.updatedAt.toISOString()
        : String(entity.updatedAt);

    return dto;
  }

  @Field()
  idBudgets!: string;

  @Field({ nullable: true })
  idLeads?: string;

  @Field()
  budgetNumber!: string;

  @Field(() => BudgetStatus)
  status!: BudgetStatus;

  @Field()
  issueDate!: string;

  @Field()
  validUntil!: string;

  @Field(() => [String])
  eventDates!: string[];

  @Field({ nullable: true })
  eventLocation?: string;

  @Field({ nullable: true })
  guestCount?: number;

  @Field({ nullable: true })
  durationHours?: number;

  @Field({ nullable: true })
  paymentMethod?: string;

  @Field(() => Float, { nullable: true })
  advancePercentage?: number;

  @Field(() => Float)
  subtotal!: number;

  @Field(() => Float)
  totalAmount!: number;

  @Field({ nullable: true })
  sentVia?: string;

  @Field({ nullable: true })
  sentAt?: string;

  @Field(() => [UpdateBudgetItemResponseDto], { nullable: true })
  items?: UpdateBudgetItemResponseDto[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
