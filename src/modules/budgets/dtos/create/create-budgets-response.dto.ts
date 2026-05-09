import { Field, Float, ObjectType } from "@nestjs/graphql";
import { BudgetStatus } from "../../enums/budget-status.enum";
import { IBudget } from "../../interface/budget.interface";
import { formatBudgetDateOnly } from "../../utils/budget-date.util";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";

@ObjectType()
class CreateBudgetItemResponseDto {
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

@ObjectType()
export class CreateBudgetsResponseDto implements IBudget {
  static fromEntity(
    entity: import("../../entities/budgets.entity").BudgetsEntity,
  ): CreateBudgetsResponseDto {
    const dto = new CreateBudgetsResponseDto();
    dto.idBudgets = entity.idBudgets;
    dto.idLeads = entity.idLeads;
    dto.budgetNumber = entity.budgetNumber;
    dto.status = entity.status;
    dto.issueDate = formatBudgetDateOnly(entity.issueDate);
    dto.validUntil = formatBudgetDateOnly(entity.validUntil);
    dto.eventDates = entity.eventDates ?? [];
    dto.eventArrivalTimes = entity.eventArrivalTimes ?? [];
    dto.eventDepartureTimes = entity.eventDepartureTimes ?? [];
    dto.eventLocation = entity.eventLocation;
    dto.guestCount = entity.guestCount;
    dto.durationHours = entity.durationHours;
    dto.paymentMethod = entity.paymentMethod;
    dto.advancePercentage = entity.advancePercentage;
    dto.displacementFee = entity.displacementFee ?? 0;
    dto.subtotal = entity.subtotal;
    dto.totalAmount = entity.totalAmount;
    dto.sentVia = entity.sentVia;
    dto.sentAt =
      entity.sentAt instanceof Date
        ? formatLocalDateTime(entity.sentAt)
        : entity.sentAt
          ? String(entity.sentAt)
          : undefined;
    dto.items = (entity.items ?? []).map((item) => ({
      idBudgetItems: item.idBudgetItems,
      idPositions: item.idPositions,
      position: item.position?.name || null,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      notes: item.notes,
      sortOrder: item.sortOrder,
      createdAt:
        item.createdAt instanceof Date
          ? formatLocalDateTime(item.createdAt) || String(item.createdAt)
          : String(item.createdAt),
      updatedAt:
        item.updatedAt instanceof Date
          ? formatLocalDateTime(item.updatedAt) || String(item.updatedAt)
          : String(item.updatedAt),
    }));
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

  @Field(() => [String])
  eventArrivalTimes!: string[];

  @Field(() => [String])
  eventDepartureTimes!: string[];

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
  displacementFee!: number;

  @Field(() => Float)
  subtotal!: number;

  @Field(() => Float)
  totalAmount!: number;

  @Field({ nullable: true })
  sentVia?: string;

  @Field({ nullable: true })
  sentAt?: string;

  @Field(() => [CreateBudgetItemResponseDto], { nullable: true })
  items?: CreateBudgetItemResponseDto[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
