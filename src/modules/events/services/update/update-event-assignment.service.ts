import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { EventAssignmentEntity } from "../../entities/event-assignment.entity";
import { EmployeesEntity } from "../../../employees/entities/employees.entity";
import { UpdateEventAssignmentInputDto } from "../../dtos/update/update-event-assignment-input.dto";
import { UpdateEventAssignmentResponseDto } from "../../dtos/update/update-event-assignment-response.dto";
import { EmployeeGender } from "../../../employees/enums/employee-gender.enum";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function inferRequiredGenderFromServiceDescription(
  description?: string,
): EmployeeGender | undefined {
  const normalized = normalizeText(description || "");

  // Female terms
  if (
    normalized.includes("copeira") ||
    normalized.includes("garconete") ||
    normalized.includes("porteira") ||
    normalized.includes("monitora")
  ) {
    return EmployeeGender.FEMALE;
  }

  // Male terms
  if (
    normalized.includes("copeiro") ||
    normalized.includes("garcom") ||
    normalized.includes("garcon") ||
    normalized.includes("porteiro") ||
    normalized.includes("monitor")
  ) {
    return EmployeeGender.MALE;
  }

  return undefined;
}

@Injectable()
export class UpdateEventAssignmentService {
  constructor(
    @InjectRepository(EventAssignmentEntity)
    private readonly eventAssignmentsRepository: Repository<EventAssignmentEntity>,
    @InjectRepository(EmployeesEntity)
    private readonly employeesRepository: Repository<EmployeesEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    userId: string,
    input: UpdateEventAssignmentInputDto,
  ): Promise<UpdateEventAssignmentResponseDto> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const record = await this.eventAssignmentsRepository.findOne({
      where: { idEventAssignments: input.idEventAssignments },
      relations: { event: true, budgetItem: true },
    });

    if (!record) {
      throw AppException.from(APP_ERRORS.events.assignmentNotFound, undefined);
    }

    if (!input.idEmployees?.trim()) {
      throw AppException.from(APP_ERRORS.events.employeeRequired, undefined);
    }

    if (
      input.employeePayment === undefined ||
      input.employeePayment === null ||
      Number.isNaN(Number(input.employeePayment))
    ) {
      throw AppException.from(
        APP_ERRORS.events.employeePaymentRequired,
        undefined,
      );
    }

    const employee = await this.employeesRepository.findOne({
      where: { idEmployees: input.idEmployees },
    });

    if (!employee) {
      throw AppException.from(APP_ERRORS.events.employeeNotFound, undefined);
    }

    if (!employee.isActive) {
      throw AppException.from(APP_ERRORS.events.employeeInactive, undefined);
    }

    const requiredGender = inferRequiredGenderFromServiceDescription(
      record.budgetItem?.description,
    );

    if (requiredGender && employee.gender !== requiredGender) {
      throw AppException.from(
        APP_ERRORS.events.employeeGenderMismatch,
        undefined,
      );
    }

    record.idEmployees = employee.idEmployees;
    record.employeePayment = Number(input.employeePayment.toFixed(2));

    if (input.isActive !== undefined) {
      record.isActive = input.isActive;
    }

    const saved = await this.eventAssignmentsRepository.save(record);

    const complete = await this.eventAssignmentsRepository.findOne({
      where: { idEventAssignments: saved.idEventAssignments },
      relations: { employee: true, budgetItem: true },
    });

    return UpdateEventAssignmentResponseDto.fromEntity(complete || saved);
  }
}
