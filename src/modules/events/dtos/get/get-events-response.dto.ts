import { Field, Float, ObjectType } from "@nestjs/graphql";
import { EventStatus } from "../../enums/event-status.enum";
import { IEvent } from "../../interface/event.interface";
import { EventEntity } from "../../entities/event.entity";
import { GetEventAssignmentResponseDto } from "./get-event-assignment-response.dto";
import { GetEventServiceLineResponseDto } from "./get-event-service-line-response.dto";

@ObjectType()
export class GetEventsResponseDto implements IEvent {
  static fromEntity(entity: EventEntity): GetEventsResponseDto {
    const dto = new GetEventsResponseDto();
    dto.idEvents = entity.idEvents;
    dto.idContracts = entity.idContracts;
    dto.idBudgets = entity.idBudgets;
    dto.idLeads = entity.idLeads;
    dto.idCustomers = entity.idCustomers;
    dto.status = entity.status;
    dto.notes = entity.notes;
    dto.contractNumber = entity.contract?.contractNumber;
    dto.budgetNumber = entity.budget?.budgetNumber;
    dto.customerName = entity.customer?.name;
    dto.leadName = entity.lead?.name;
    dto.eventDates = entity.budget?.eventDates ?? [];
    dto.eventLocation = entity.budget?.eventLocation;
    dto.displacementFee = Number(entity.budget?.displacementFee ?? 0);

    dto.serviceBreakdown = [...(entity.budget?.items ?? [])]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(GetEventServiceLineResponseDto.fromEntity);

    const totalRevenue = Number(entity.budget?.totalAmount ?? 0);
    const totalCost = Number(
      (entity.assignments ?? []).reduce(
        (sum, assignment) => sum + Number(assignment.employeePayment ?? 0),
        0,
      ),
    );

    dto.totalRevenue = Number(totalRevenue.toFixed(2));
    dto.totalCost = Number(totalCost.toFixed(2));
    dto.companyReceivable = Number((totalRevenue - totalCost).toFixed(2));

    dto.assignments = (entity.assignments ?? []).map(
      GetEventAssignmentResponseDto.fromEntity,
    );

    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }

  @Field()
  idEvents!: string;

  @Field()
  idContracts!: string;

  @Field()
  idBudgets!: string;

  @Field({ nullable: true })
  idLeads?: string;

  @Field({ nullable: true })
  idCustomers?: string;

  @Field(() => EventStatus)
  status!: EventStatus;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  contractNumber?: string;

  @Field({ nullable: true })
  budgetNumber?: string;

  @Field({ nullable: true })
  customerName?: string;

  @Field({ nullable: true })
  leadName?: string;

  @Field(() => [String])
  eventDates!: string[];

  @Field({ nullable: true })
  eventLocation?: string;

  @Field(() => Float)
  displacementFee!: number;

  @Field(() => [GetEventServiceLineResponseDto])
  serviceBreakdown!: GetEventServiceLineResponseDto[];

  @Field(() => Float)
  totalRevenue!: number;

  @Field(() => Float)
  totalCost!: number;

  @Field(() => Float)
  companyReceivable!: number;

  @Field(() => [GetEventAssignmentResponseDto])
  assignments!: GetEventAssignmentResponseDto[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
