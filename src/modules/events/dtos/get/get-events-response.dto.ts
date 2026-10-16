import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { EventStatus } from "../../enums/event-status.enum";
import { IEvent } from "../../interface/event.interface";
import { EventEntity } from "../../entities/event.entity";
import { GetEventAssignmentResponseDto } from "./get-event-assignment-response.dto";
import { GetEventServiceLineResponseDto } from "./get-event-service-line-response.dto";
import { GetEventExtraExpenseResponseDto } from "./get-event-extra-expense-response.dto";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";

@ObjectType()
export class GetEventsResponseDto implements IEvent {
  static fromEntity(entity: EventEntity): GetEventsResponseDto {
    const dto = new GetEventsResponseDto();
    dto.idEvents = entity.idEvents;
    dto.eventNumber = entity.eventNumber ?? undefined;
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
    const eventLocations = Array.from(
      new Set((entity.budget?.eventLocation ?? []).filter(Boolean)),
    );
    dto.eventLocation = eventLocations.length
      ? eventLocations.join(" / ")
      : undefined;
    dto.eventArrivalTimes = entity.budget?.eventArrivalTimes ?? [];
    dto.eventDepartureTimes = entity.budget?.eventDepartureTimes ?? [];
    dto.eventLocationPerDay = entity.budget?.eventLocation ?? [];
    dto.guestCountPerDay = entity.budget?.guestCount ?? [];
    dto.durationHoursPerDay = entity.budget?.durationHours ?? [];
    const displacementFeeTotal = (entity.budget?.displacementFee ?? []).reduce(
      (sum, value) => sum + Number(value ?? 0),
      0,
    );
    dto.displacementFee = Number(displacementFeeTotal.toFixed(2));
    dto.discountTotal = Number(
      Math.max(
        0,
        Number(entity.budget?.subtotal ?? 0) +
          displacementFeeTotal -
          Number(entity.budget?.totalAmount ?? 0),
      ).toFixed(2),
    );
    dto.overtimeMinutes = Number(entity.overtimeMinutes ?? 0);
    dto.overtimeHourlyRate = Number(entity.overtimeHourlyRate ?? 0);
    dto.extraExpenses = (entity.extraExpenses ?? []).map(
      GetEventExtraExpenseResponseDto.fromValue,
    );

    dto.serviceBreakdown = [...(entity.budget?.items ?? [])]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(GetEventServiceLineResponseDto.fromEntity);

    const totalRevenue = Number(entity.budget?.totalAmount ?? 0);
    const assignmentCost = Number(
      (entity.assignments ?? []).reduce(
        (sum, assignment) => sum + Number(assignment.employeePayment ?? 0),
        0,
      ),
    );
    const activeAssignments = (entity.assignments ?? []).filter(
      (assignment) => assignment.isActive,
    );
    const overtimeHours = dto.overtimeMinutes / 60;
    const overtimeAmount =
      activeAssignments.length * overtimeHours * dto.overtimeHourlyRate;
    const overtimeCost = activeAssignments.reduce(
      (sum, assignment) =>
        sum + overtimeHours * Number(assignment.overtimeHourlyPayment ?? 0),
      0,
    );
    const extraExpensesTotal = dto.extraExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const finalTotalRevenue = totalRevenue + overtimeAmount;
    const totalCost = assignmentCost + overtimeCost + extraExpensesTotal;

    dto.totalRevenue = Number(finalTotalRevenue.toFixed(2));
    dto.totalCost = Number(totalCost.toFixed(2));
    dto.overtimeAmount = Number(overtimeAmount.toFixed(2));
    dto.overtimeCost = Number(overtimeCost.toFixed(2));
    dto.extraExpensesTotal = Number(extraExpensesTotal.toFixed(2));
    dto.companyReceivable = Number((finalTotalRevenue - totalCost).toFixed(2));

    dto.assignments = (entity.assignments ?? []).map(
      GetEventAssignmentResponseDto.fromEntity,
    );

    dto.createdAt =
      formatLocalDateTime(entity.createdAt) || String(entity.createdAt);
    dto.updatedAt =
      formatLocalDateTime(entity.updatedAt) || String(entity.updatedAt);
    return dto;
  }

  @Field()
  idEvents!: string;

  @Field({ nullable: true })
  eventNumber?: string;

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

  @Field(() => [String])
  eventArrivalTimes!: string[];

  @Field(() => [String])
  eventDepartureTimes!: string[];

  @Field(() => [String])
  eventLocationPerDay!: string[];

  @Field(() => [Int])
  guestCountPerDay!: number[];

  @Field(() => [Int])
  durationHoursPerDay!: number[];

  @Field(() => Float)
  displacementFee!: number;

  @Field(() => Float)
  discountTotal!: number;

  @Field(() => Int)
  overtimeMinutes!: number;

  @Field(() => Float)
  overtimeHourlyRate!: number;

  @Field(() => Float)
  overtimeAmount!: number;

  @Field(() => Float)
  overtimeCost!: number;

  @Field(() => [GetEventExtraExpenseResponseDto])
  extraExpenses!: GetEventExtraExpenseResponseDto[];

  @Field(() => Float)
  extraExpensesTotal!: number;

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
