import { Repository } from "typeorm";
import { eventsErrors } from "../../../../common/exceptions/catalogs/events-errors.catalog";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { BudgetItemsEntity } from "../../../budgets/entities/budget-items.entity";
import { EmployeesEntity } from "../../../employees/entities/employees.entity";
import { EmployeeGender } from "../../../employees/enums/employee-gender.enum";
import { EventAssignmentEntity } from "../../entities/event-assignment.entity";
import { UpdateEventAssignmentService } from "../../services/update/update-event-assignment.service";

function buildAssignment(
  overrides: Partial<EventAssignmentEntity> = {},
  eventDateIndex = 0,
): EventAssignmentEntity {
  const assignment = new EventAssignmentEntity();
  assignment.idEventAssignments = "assignment-1";
  assignment.idEvents = "event-1";
  assignment.idBudgetItems = "item-1";
  assignment.allocationIndex = 1;
  assignment.employeePayment = 0;
  assignment.overtimeHourlyPayment = 30;
  assignment.isActive = true;
  assignment.budgetItem = {
    description: "Copeira",
    eventDateIndex,
  } as BudgetItemsEntity;
  assignment.createdAt = new Date("2026-10-15T12:00:00Z");
  assignment.updatedAt = new Date("2026-10-15T12:00:00Z");
  return Object.assign(assignment, overrides);
}

describe("UpdateEventAssignmentService", () => {
  let assignmentsRepository: jest.Mocked<Repository<EventAssignmentEntity>>;
  let employeesRepository: jest.Mocked<Repository<EmployeesEntity>>;
  let service: UpdateEventAssignmentService;

  const employee = {
    idEmployees: "employee-1",
    isActive: true,
    gender: EmployeeGender.FEMALE,
  } as EmployeesEntity;

  beforeEach(() => {
    assignmentsRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn((entity) => Promise.resolve(entity)),
    } as unknown as jest.Mocked<Repository<EventAssignmentEntity>>;

    employeesRepository = {
      findOne: jest.fn().mockResolvedValue(employee),
    } as unknown as jest.Mocked<Repository<EmployeesEntity>>;

    const authorizationService = {
      assertPermissionForUserId: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthorizationService;

    service = new UpdateEventAssignmentService(
      assignmentsRepository,
      employeesRepository,
      authorizationService,
    );
  });

  it("allows the same employee on a different day of the same event", async () => {
    const record = buildAssignment({}, 1);
    assignmentsRepository.findOne
      .mockResolvedValueOnce(record)
      .mockResolvedValueOnce(null);
    assignmentsRepository.find.mockResolvedValue([
      buildAssignment(
        { idEventAssignments: "assignment-day-0", idEmployees: "employee-1" },
        0,
      ),
    ]);

    const result = await service.execute("user-1", {
      idEventAssignments: "assignment-1",
      idEmployees: "employee-1",
      employeePayment: 150,
      overtimeHourlyPayment: 35,
    });

    expect(result.idEmployees).toBe("employee-1");
    expect(result.employeePayment).toBe(150);
    expect(result.overtimeHourlyPayment).toBe(35);
  });

  it("rejects the same employee twice on the same event day", async () => {
    assignmentsRepository.findOne.mockResolvedValueOnce(buildAssignment({}, 0));
    assignmentsRepository.find.mockResolvedValue([
      buildAssignment(
        { idEventAssignments: "assignment-2", idEmployees: "employee-1" },
        0,
      ),
    ]);

    await expect(
      service.execute("user-1", {
        idEventAssignments: "assignment-1",
        idEmployees: "employee-1",
        employeePayment: 150,
      }),
    ).rejects.toThrow(eventsErrors.employeeAlreadyAssignedOnDay.message);
    expect(assignmentsRepository.save).not.toHaveBeenCalled();
  });

  it("keeps the current overtime payment when none is informed", async () => {
    assignmentsRepository.findOne
      .mockResolvedValueOnce(buildAssignment({ overtimeHourlyPayment: 42 }))
      .mockResolvedValueOnce(null);
    assignmentsRepository.find.mockResolvedValue([]);

    const result = await service.execute("user-1", {
      idEventAssignments: "assignment-1",
      idEmployees: "employee-1",
      employeePayment: 150,
    });

    expect(result.overtimeHourlyPayment).toBe(42);
  });
});
