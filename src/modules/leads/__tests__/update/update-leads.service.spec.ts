import { Test, TestingModule } from "@nestjs/testing";
import { UpdateLeadsService } from "../../services/update/update-leads.service";
import { leadMock } from "../../__mocks__/lead.mock";

describe("UpdateLeadsService", () => {
  let service: UpdateLeadsService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest
        .fn()
        .mockResolvedValue({ ...leadMock, name: "Lead Atualizado" }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: UpdateLeadsService, useValue: serviceMock }],
    }).compile();

    service = module.get<UpdateLeadsService>(UpdateLeadsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should update a lead", async () => {
    const result = await service.execute("user-id-test", {
      idLeads: "lead-1",
      name: "Lead Atualizado",
    });

    expect(result.name).toBe("Lead Atualizado");
  });

  it("should throw error if lead not found", async () => {
    (service.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Lead não encontrado."),
    );

    await expect(
      service.execute("user-id-test", { idLeads: "missing" }),
    ).rejects.toThrow("Lead não encontrado.");
  });
});
