import { Field, Float, ObjectType } from "@nestjs/graphql";
import { EventAssignmentEntity } from "../../entities/event-assignment.entity";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";

@ObjectType()
export class UpdateEventAssignmentResponseDto {
  static fromEntity(
    entity: EventAssignmentEntity,
  ): UpdateEventAssignmentResponseDto {
    const dto = new UpdateEventAssignmentResponseDto();
    dto.idEventAssignments = entity.idEventAssignments;
    dto.idEvents = entity.idEvents;
    dto.idBudgetItems = entity.idBudgetItems;
    dto.idEmployees = entity.idEmployees;
    dto.allocationIndex = entity.allocationIndex;
    dto.employeePayment = entity.employeePayment;
    dto.isActive = entity.isActive;
    dto.employeeName = entity.employee?.name;
    dto.budgetItemDescription = entity.budgetItem?.description;
    dto.updatedAt =
      formatLocalDateTime(entity.updatedAt) || String(entity.updatedAt);
    return dto;
  }

  @Field()
  idEventAssignments!: string;

  @Field()
  idEvents!: string;

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
  employeeName?: string;

  @Field({ nullable: true })
  budgetItemDescription?: string;

  @Field()
  updatedAt!: string;
}
