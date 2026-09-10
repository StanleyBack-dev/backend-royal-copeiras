import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { BudgetStatus } from "../../enums/budget-status.enum";
import { BudgetItemType } from "../../enums/budget-item-type.enum";
import { IBudget } from "../../interface/budget.interface";
import { formatBudgetDateOnly } from "../../utils/budget-date.util";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";

@ObjectType()
class UpdateBudgetItemResponseDto {
  @Field()
  idBudgetItems!: string;

  @Field(() => BudgetItemType)
  itemType!: BudgetItemType;

  @Field(() => String, { nullable: true })
  idPositions?: string | null;

  @Field(() => String, { nullable: true })
  position?: string | null;

  @Field(() => String, { nullable: true })
  idSupplies?: string | null;

  @Field(() => String, { nullable: true })
  supply?: string | null;

  @Field(() => String, { nullable: true })
  unit?: string | null;

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

  @Field(() => Int)
  eventDateIndex!: number;

  @Field(() => String, { nullable: true })
  serviceGender?: string | null;

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
    dto.issueDate = formatBudgetDateOnly(entity.issueDate);
    dto.validUntil = formatBudgetDateOnly(entity.validUntil);
    dto.eventDates = entity.eventDates ?? [];
    dto.eventArrivalTimes = entity.eventArrivalTimes ?? [];
    dto.eventDepartureTimes = entity.eventDepartureTimes ?? [];
    dto.eventLocation = entity.eventLocation ?? [];
    dto.guestCount = entity.guestCount ?? [];
    dto.durationHours = entity.durationHours ?? [];
    dto.paymentMethod = entity.paymentMethod;
    dto.advancePercentage = entity.advancePercentage;
    dto.discountPercentage = entity.discountPercentage ?? [];
    dto.discountType = entity.discountType ?? [];
    dto.discountAmount = entity.discountAmount ?? [];
    dto.displacementFee = entity.displacementFee ?? [];
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
      itemType: item.itemType ?? BudgetItemType.LABOR,
      idPositions: item.idPositions,
      position: item.position?.name || null,
      idSupplies: item.idSupplies ?? null,
      supply: item.supply?.name || null,
      unit: item.unit ?? null,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      notes: item.notes,
      sortOrder: item.sortOrder,
      eventDateIndex: item.eventDateIndex ?? 0,
      serviceGender: item.serviceGender ?? null,
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

  @Field(() => [String])
  eventLocation!: string[];

  @Field(() => [Int])
  guestCount!: number[];

  @Field(() => [Int])
  durationHours!: number[];

  @Field({ nullable: true })
  paymentMethod?: string;

  @Field(() => Float, { nullable: true })
  advancePercentage?: number;

  @Field(() => [Float])
  discountPercentage!: number[];

  @Field(() => [String])
  discountType!: string[];

  @Field(() => [Float])
  discountAmount!: number[];

  @Field(() => [Float])
  displacementFee!: number[];

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
