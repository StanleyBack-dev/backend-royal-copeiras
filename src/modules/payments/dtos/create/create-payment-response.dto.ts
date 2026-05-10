import { Field, Float, ObjectType } from "@nestjs/graphql";
import { PaymentStatus } from "../../enums/payment-status.enum";
import { PaymentOrigin } from "../../enums/payment-origin.enum";
import type { IPayment } from "../../interfaces";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";
import { PaymentItemResponseDto } from "../shared/payment-item-response.dto";

@ObjectType()
export class CreatePaymentResponseDto implements IPayment {
  static fromEntity(
    entity: import("../../entities/payments.entity").PaymentsEntity,
  ): CreatePaymentResponseDto {
    const dto = new CreatePaymentResponseDto();
    dto.idPayments = entity.idPayments;
    dto.idUsers = entity.idUsers;
    dto.idLeads = entity.idLeads;
    dto.idBudgets = entity.idBudgets;
    dto.idContracts = entity.idContracts;
    dto.idEvents = entity.idEvents;
    dto.idEmployees = entity.idEmployees;
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
    dto.paymentItems = (entity.paymentItems ?? []).map((item) =>
      PaymentItemResponseDto.fromEntity(item),
    );
    dto.createdAt =
      formatLocalDateTime(entity.createdAt) || String(entity.createdAt);
    dto.updatedAt =
      formatLocalDateTime(entity.updatedAt) || String(entity.updatedAt);
    return dto;
  }

  @Field()
  idPayments!: string;

  @Field()
  idUsers!: string;

  @Field({ nullable: true })
  idLeads?: string;

  @Field({ nullable: true })
  idBudgets?: string;

  @Field({ nullable: true })
  idContracts?: string;

  @Field({ nullable: true })
  idEvents?: string;

  @Field({ nullable: true })
  idEmployees?: string;

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

  @Field(() => [PaymentItemResponseDto], { nullable: true })
  paymentItems?: PaymentItemResponseDto[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
