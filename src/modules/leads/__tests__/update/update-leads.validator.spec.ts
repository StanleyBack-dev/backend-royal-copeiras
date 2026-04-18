import { Repository } from "typeorm";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { LeadsEntity } from "../../entities/leads.entity";
import { LeadStatus } from "../../enums/lead-status.enum";
import { UpdateLeadsValidator } from "../../validators/update/update-leads.validator";
import { UpdateLeadsInputDto } from "../../dtos/update/update-leads-input.dto";
import { leadMock } from "../../__mocks__/lead.mock";

function makeLead(overrides: Partial<LeadsEntity> = {}): LeadsEntity {
  return {
    ...leadMock,
    ...overrides,
  } as LeadsEntity;
}

describe("UpdateLeadsValidator", () => {
  const userId = "user-1";

  function makeRepo() {
    return {
      findOne: jest.fn<Promise<LeadsEntity | null>, [unknown]>(),
      save: jest.fn<Promise<LeadsEntity>, [LeadsEntity]>(),
    };
  }

  it("should throw when idLeads is not provided", async () => {
    const repo = makeRepo();

    const input = new UpdateLeadsInputDto();

    await expect(
      UpdateLeadsValidator.validateAndUpdate(
        userId,
        input,
        repo as unknown as Repository<LeadsEntity>,
      ),
    ).rejects.toThrow(APP_ERRORS.leads.idRequired.message as string);
  });

  it("should throw when lead is not found", async () => {
    const repo = makeRepo();
    repo.findOne.mockResolvedValue(null);

    const input = new UpdateLeadsInputDto();
    input.idLeads = "missing";
    input.name = "Novo Nome";

    await expect(
      UpdateLeadsValidator.validateAndUpdate(
        userId,
        input,
        repo as unknown as Repository<LeadsEntity>,
      ),
    ).rejects.toThrow(APP_ERRORS.leads.notFound.message as string);
  });

  it("should throw when no update data is provided", async () => {
    const repo = makeRepo();
    repo.findOne.mockResolvedValue(makeLead());

    const input = new UpdateLeadsInputDto();
    input.idLeads = "lead-1";

    await expect(
      UpdateLeadsValidator.validateAndUpdate(
        userId,
        input,
        repo as unknown as Repository<LeadsEntity>,
      ),
    ).rejects.toThrow(APP_ERRORS.leads.noUpdateData.message as string);
  });

  it("should throw for invalid status transition", async () => {
    const repo = makeRepo();
    repo.findOne.mockResolvedValue(makeLead({ status: LeadStatus.WON }));

    const input = new UpdateLeadsInputDto();
    input.idLeads = "lead-1";
    input.status = LeadStatus.QUALIFIED;

    await expect(
      UpdateLeadsValidator.validateAndUpdate(
        userId,
        input,
        repo as unknown as Repository<LeadsEntity>,
      ),
    ).rejects.toThrow(
      APP_ERRORS.leads.invalidStatusTransition.message as string,
    );
  });

  it("should update lead for valid status transition", async () => {
    const repo = makeRepo();
    const record = makeLead({ status: LeadStatus.NEW });
    repo.findOne.mockResolvedValue(record);
    repo.save.mockImplementation(async (entity) => entity);

    const input = new UpdateLeadsInputDto();
    input.idLeads = "lead-1";
    input.status = LeadStatus.QUALIFIED;
    input.notes = "Lead qualificado";

    const result = await UpdateLeadsValidator.validateAndUpdate(
      userId,
      input,
      repo as unknown as Repository<LeadsEntity>,
    );

    expect(result.status).toBe(LeadStatus.QUALIFIED);
    expect(result.notes).toBe("Lead qualificado");
    expect(repo.save).toHaveBeenCalledTimes(1);
  });
});
