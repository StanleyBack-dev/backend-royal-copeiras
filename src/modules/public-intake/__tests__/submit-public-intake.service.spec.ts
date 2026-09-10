import { SubmitPublicIntakeService } from "../services/submit/submit-public-intake.service";
import { PublicIntakeCodesService } from "../services/public-intake-codes.service";
import { CreateLeadsValidator } from "../../leads/validators/create/create-leads.validator";
import * as generateBudgetNumberUtil from "../../budgets/utils/generate-budget-number.util";
import { APP_ERRORS } from "../../../common/exceptions/app-errors.catalog";
import { LeadSource } from "../../leads/enums/lead-source.enum";
import { LeadsEntity } from "../../leads/entities/leads.entity";
import { BudgetsEntity } from "../../budgets/entities/budgets.entity";
import { BudgetItemsEntity } from "../../budgets/entities/budget-items.entity";
import { PublicBudgetRequestNotificationEmailService } from "../../mails/services/public-budget-request-notification-email.service";

describe("SubmitPublicIntakeService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("rejects a form token that isn't active", async () => {
    const codesService: Partial<PublicIntakeCodesService> = {
      findByFormToken: jest.fn().mockResolvedValue(null),
    };

    const leadsRepository = { manager: { transaction: jest.fn() } };
    const notificationEmailService: Partial<PublicBudgetRequestNotificationEmailService> =
      {
        send: jest.fn().mockResolvedValue(undefined),
      };

    const suppliesRepository = { find: jest.fn().mockResolvedValue([]) };

    const service = new SubmitPublicIntakeService(
      leadsRepository as never,
      codesService as never,
      notificationEmailService as never,
      suppliesRepository as never,
    );

    await expect(
      service.execute({
        formToken: "invalid",
        name: "Cliente",
        eventDates: ["2026-10-10"],
      } as never),
    ).rejects.toThrow(
      APP_ERRORS.publicIntake.formTokenInvalidOrExpired.message as string,
    );
    expect(leadsRepository.manager.transaction).not.toHaveBeenCalled();
  });

  it("creates the lead and a draft budget, then consumes the form token", async () => {
    const activeForm = {
      idPublicIntakeCodes: "code-1",
      idUsers: "operator-1",
    };

    const createdLead = {
      idLeads: "lead-1",
      name: "Cliente Teste",
      email: "cliente@example.com",
      phone: undefined,
      document: undefined,
    };
    const createdBudget = {
      idBudgets: "budget-1",
      budgetNumber: "ORC-2026-00099",
      eventDates: ["2026-10-10"],
      eventArrivalTimes: ["18:00"],
      eventDepartureTimes: ["23:00"],
      eventLocation: ["Salão de festas"],
      guestCount: [80],
      durationHours: [5],
    };

    jest
      .spyOn(CreateLeadsValidator, "validateAndCreate")
      .mockResolvedValue(createdLead as never);
    jest
      .spyOn(generateBudgetNumberUtil, "generateBudgetNumber")
      .mockResolvedValue("ORC-2026-00099");

    const budgetsRepoTx = {
      create: jest.fn((value: unknown) => value),
      save: jest.fn().mockResolvedValue(createdBudget),
    };
    const budgetItemsRepoTx = {
      create: jest.fn((value: unknown) => value),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const leadsRepoTx = {
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      })),
    };

    const manager = {
      getRepository: jest.fn((entity: unknown) => {
        if (entity === BudgetsEntity) return budgetsRepoTx;
        if (entity === BudgetItemsEntity) return budgetItemsRepoTx;
        if (entity === LeadsEntity) return leadsRepoTx;
        throw new Error(`Unexpected repository requested: ${String(entity)}`);
      }),
    };

    const codesService: Partial<PublicIntakeCodesService> = {
      findByFormToken: jest.fn().mockResolvedValue(activeForm),
      consume: jest.fn().mockResolvedValue(undefined),
    };

    const leadsRepository = {
      manager: {
        transaction: jest.fn(async (run: (m: unknown) => Promise<unknown>) =>
          run(manager),
        ),
      },
    };

    const notificationEmailService: Partial<PublicBudgetRequestNotificationEmailService> =
      {
        send: jest.fn().mockResolvedValue(undefined),
      };

    const suppliesRepository = { find: jest.fn().mockResolvedValue([]) };

    const service = new SubmitPublicIntakeService(
      leadsRepository as never,
      codesService as never,
      notificationEmailService as never,
      suppliesRepository as never,
    );

    const result = await service.execute({
      formToken: "valid-token",
      name: "Cliente Teste",
      email: "cliente@example.com",
      addressStreet: "Rua 6",
      addressNumber: "SN",
      addressNeighborhood: "Polo Empresarial",
      addressCity: "Aparecida de Goiânia",
      addressState: "go",
      addressZipCode: "74985-105",
      eventDates: ["2026-10-10"],
      eventArrivalTimes: ["18:00"],
      eventDepartureTimes: ["23:00"],
      eventLocation: ["Salão de festas"],
      guestCount: [80],
      durationHours: [5],
      items: [
        {
          description: "Copeira",
          gender: "Feminino",
          quantity: 3,
          eventDateIndex: 0,
        },
      ],
    } as never);

    expect(CreateLeadsValidator.validateAndCreate).toHaveBeenCalledWith(
      "operator-1",
      expect.objectContaining({
        name: "Cliente Teste",
        source: LeadSource.PUBLIC_FORM,
        addressStreet: "Rua 6",
        addressNumber: "SN",
        addressState: "GO",
        addressZipCode: "74985-105",
        address: "Rua 6, SN, Polo Empresarial",
      }),
      leadsRepoTx,
    );
    expect(budgetsRepoTx.create).toHaveBeenCalledWith(
      expect.objectContaining({
        idUsers: "operator-1",
        idLeads: "lead-1",
        budgetNumber: "ORC-2026-00099",
        eventLocation: ["Salão de festas"],
        guestCount: [80],
        paymentMethod: "PIX",
        advancePercentage: 30,
      }),
    );
    expect(budgetItemsRepoTx.create).toHaveBeenCalledWith(
      expect.objectContaining({
        idBudgets: "budget-1",
        description: "Copeira",
        serviceGender: "feminine",
        quantity: 3,
      }),
    );
    expect(codesService.consume).toHaveBeenCalledWith(activeForm, {
      resultingLeadId: "lead-1",
      resultingBudgetId: "budget-1",
    });
    expect(notificationEmailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        leadName: "Cliente Teste",
        leadEmail: "cliente@example.com",
        idBudgets: "budget-1",
        budgetNumber: "ORC-2026-00099",
        eventLocation: ["Salão de festas"],
        guestCount: [80],
        durationHours: [5],
        items: [
          {
            description: "Copeira",
            serviceGender: "feminine",
            quantity: 3,
            eventDateIndex: 0,
          },
        ],
      }),
    );
    expect(result).toEqual({ idLeads: "lead-1", idBudgets: "budget-1" });
  });

  it("takes the material name and unit from the catalog for SUPPLY items", async () => {
    const activeForm = { idPublicIntakeCodes: "code-1", idUsers: "operator-1" };
    const createdLead = { idLeads: "lead-1", name: "Cliente" };
    const createdBudget = { idBudgets: "budget-1", budgetNumber: "ORC-1" };

    jest
      .spyOn(CreateLeadsValidator, "validateAndCreate")
      .mockResolvedValue(createdLead as never);
    jest
      .spyOn(generateBudgetNumberUtil, "generateBudgetNumber")
      .mockResolvedValue("ORC-1");

    const budgetItemsRepoTx = {
      create: jest.fn((value: unknown) => value),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const manager = {
      getRepository: jest.fn((entity: unknown) => {
        if (entity === BudgetsEntity)
          return {
            create: jest.fn((value: unknown) => value),
            save: jest.fn().mockResolvedValue(createdBudget),
          };
        if (entity === BudgetItemsEntity) return budgetItemsRepoTx;
        if (entity === LeadsEntity)
          return {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(null),
            })),
          };
        throw new Error(`Unexpected repository: ${String(entity)}`);
      }),
    };

    const suppliesRepository = {
      find: jest.fn().mockResolvedValue([
        {
          idSupplies: "s1",
          idUsers: "operator-1",
          name: "Papel higiênico",
          defaultUnit: "rolo",
          isActive: true,
        },
      ]),
    };

    const service = new SubmitPublicIntakeService(
      {
        manager: {
          transaction: jest.fn(async (run: (m: unknown) => Promise<unknown>) =>
            run(manager),
          ),
        },
      } as never,
      {
        findByFormToken: jest.fn().mockResolvedValue(activeForm),
        consume: jest.fn().mockResolvedValue(undefined),
      } as never,
      { send: jest.fn().mockResolvedValue(undefined) } as never,
      suppliesRepository as never,
    );

    await service.execute({
      formToken: "valid-token",
      name: "Cliente",
      eventDates: ["2026-10-10"],
      eventArrivalTimes: ["18:00"],
      eventDepartureTimes: ["23:00"],
      eventLocation: ["Salão"],
      guestCount: [80],
      durationHours: [5],
      items: [
        {
          itemType: "SUPPLY",
          idSupplies: "s1",
          description: "digitado pelo cliente",
          unit: "caixa",
          quantity: 4,
          eventDateIndex: 0,
        },
      ],
    } as never);

    expect(suppliesRepository.find).toHaveBeenCalled();
    expect(budgetItemsRepoTx.create).toHaveBeenCalledWith(
      expect.objectContaining({
        itemType: "SUPPLY",
        idSupplies: "s1",
        description: "Papel higiênico",
        unit: "rolo",
        quantity: 4,
      }),
    );
  });
});
