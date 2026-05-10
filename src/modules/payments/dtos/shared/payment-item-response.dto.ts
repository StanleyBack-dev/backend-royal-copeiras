import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { PaymentOrigin } from "../../enums/payment-origin.enum";
import { PaymentStatus } from "../../enums/payment-status.enum";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";

@ObjectType()
export class PaymentItemResponseDto {
  static fromEntity(
    entity: import("../../entities/payment-item.entity").PaymentItemEntity,
  ): PaymentItemResponseDto {
    const dto = new PaymentItemResponseDto();
    dto.idPaymentItems = entity.idPaymentItems;
    dto.idPayments = entity.idPayments;
    dto.origin = entity.origin;
    dto.status = entity.status;
    dto.plannedAmount = entity.plannedAmount;
    dto.paidAmount = entity.paidAmount;
    dto.paymentDate = entity.paymentDate
      ? formatLocalDateTime(entity.paymentDate)
      : undefined;
    dto.dueDate = entity.dueDate
      ? formatLocalDateTime(entity.dueDate)
      : undefined;
    dto.proofUrl = entity.proofUrl;
    dto.notes = entity.notes;
    dto.sortOrder = entity.sortOrder;
    dto.createdAt =
      formatLocalDateTime(entity.createdAt) || String(entity.createdAt);
    dto.updatedAt =
      formatLocalDateTime(entity.updatedAt) || String(entity.updatedAt);
    return dto;
  }

  @Field()
  idPaymentItems!: string;

  @Field()
  idPayments!: string;

  @Field(() => String)
  origin!: PaymentOrigin;

  @Field(() => String)
  status!: PaymentStatus;

  @Field(() => Float)
  plannedAmount!: number;

  @Field(() => Float, { nullable: true })
  paidAmount?: number;

  @Field({ nullable: true })
  paymentDate?: string;

  @Field({ nullable: true })
  dueDate?: string;

  @Field({ nullable: true })
  proofUrl?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => Int)
  sortOrder!: number;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
