import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { BudgetStatus } from "../../enums/budget-status.enum";
import { IBudget } from "../../interface/budget.interface";
import { GetBudgetItemResponseDto } from "./get-budget-item-response.dto";
import { formatBudgetDateOnly } from "../../utils/budget-date.util";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";

@ObjectType()
export class GetBudgetsResponseDto implements IBudget {
  static fromEntity(
    entity: import("../../entities/budgets.entity").BudgetsEntity,
  ): GetBudgetsResponseDto {
    const dto = new GetBudgetsResponseDto();
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
    dto.items = (entity.items ?? []).map((item) =>
      GetBudgetItemResponseDto.fromEntity(item),
    );
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

  @Field(() => [GetBudgetItemResponseDto], { nullable: true })
  items?: GetBudgetItemResponseDto[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
