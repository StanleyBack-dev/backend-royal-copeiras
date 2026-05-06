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
      relations: { event: true },
    });

    if (!record) {
      throw AppException.from(APP_ERRORS.events.assignmentNotFound, undefined);
    }

    if (input.idEmployees !== undefined) {
      if (!input.idEmployees) {
        record.idEmployees = undefined;
      } else {
        const employee = await this.employeesRepository.findOne({
          where: { idEmployees: input.idEmployees },
        });

        if (!employee) {
          throw AppException.from(
            APP_ERRORS.events.employeeNotFound,
            undefined,
          );
        }

        if (!employee.isActive) {
          throw AppException.from(
            APP_ERRORS.events.employeeInactive,
            undefined,
          );
        }

        record.idEmployees = employee.idEmployees;
      }
    }

    if (input.employeePayment !== undefined) {
      record.employeePayment = Number(input.employeePayment.toFixed(2));
    }

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
