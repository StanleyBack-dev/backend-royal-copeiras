import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { EventAssignmentEntity } from "../../entities/event-assignment.entity";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";

@ObjectType()
export class GetEventAssignmentResponseDto {
  static fromEntity(
    entity: EventAssignmentEntity,
  ): GetEventAssignmentResponseDto {
    const dto = new GetEventAssignmentResponseDto();
    dto.idEventAssignments = entity.idEventAssignments;
    dto.idBudgetItems = entity.idBudgetItems;
    dto.idEmployees = entity.idEmployees;
    dto.allocationIndex = entity.allocationIndex;
    dto.employeePayment = entity.employeePayment;
    dto.isActive = entity.isActive;
    dto.budgetItemDescription = entity.budgetItem?.description;
    dto.budgetItemQuantity = entity.budgetItem?.quantity;
    dto.eventDateIndex = entity.budgetItem?.eventDateIndex ?? 0;
    dto.employeeName = entity.employee?.name;
    dto.createdAt =
      formatLocalDateTime(entity.createdAt) || String(entity.createdAt);
    dto.updatedAt =
      formatLocalDateTime(entity.updatedAt) || String(entity.updatedAt);
    return dto;
  }

  @Field()
  idEventAssignments!: string;

  @Field()
  idBudgetItems!: string;

  @Field({ nullable: true })
  idEmployees?: string;

  @Field()
  allocationIndex!: number;

  @Field(() => Float)
  employeePayment!: number;

  @Field()
  isActive!: boolean;

  @Field({ nullable: true })
  budgetItemDescription?: string;

  @Field({ nullable: true })
  budgetItemQuantity?: number;

  @Field(() => Int)
  eventDateIndex!: number;

  @Field({ nullable: true })
  employeeName?: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
