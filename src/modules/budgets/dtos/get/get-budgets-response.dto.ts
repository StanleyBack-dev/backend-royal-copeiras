import { Field, Float, ObjectType } from "@nestjs/graphql";
import { BudgetStatus } from "../../enums/budget-status.enum";
import { IBudget } from "../../interface/budget.interface";
import { GetBudgetItemResponseDto } from "./get-budget-item-response.dto";

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
    dto.notes = entity.notes;
    dto.subtotal = entity.subtotal;
    dto.totalAmount = entity.totalAmount;
    dto.pdfUrl = entity.pdfUrl;
    dto.pdfHash = entity.pdfHash;
    dto.items = (entity.items ?? []).map((item) =>
      GetBudgetItemResponseDto.fromEntity(item),
    );
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

  @Field({ nullable: true })
  notes?: string;

  @Field(() => Float)
  subtotal!: number;

  @Field(() => Float)
  totalAmount!: number;

  @Field({ nullable: true })
  pdfUrl?: string;

  @Field({ nullable: true })
  pdfHash?: string;

  @Field(() => [GetBudgetItemResponseDto], { nullable: true })
  items?: GetBudgetItemResponseDto[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
