import { Test, TestingModule } from "@nestjs/testing";
import { CreateLeadsService } from "../../services/create/create-leads.service";
import { leadMock } from "../../__mocks__/lead.mock";
import { LeadSource } from "../../enums/lead-source.enum";

describe("CreateLeadsService", () => {
  let service: CreateLeadsService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn().mockResolvedValue(leadMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: CreateLeadsService, useValue: serviceMock }],
    }).compile();

    service = module.get<CreateLeadsService>(CreateLeadsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create a lead", async () => {
    const result = await service.execute("user-id-test", {
      name: "Lead Exemplo",
      source: LeadSource.INSTAGRAM,
      status: leadMock.status,
      isActive: true,
    });

    expect(result).toEqual(leadMock);
  });

  it("should throw error when create fails", async () => {
    (service.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Erro ao criar lead."),
    );

    await expect(
      service.execute("user-id-test", {
        name: "Lead Exemplo",
        source: LeadSource.INSTAGRAM,
        status: leadMock.status,
        isActive: true,
      }),
    ).rejects.toThrow("Erro ao criar lead.");
  });
});
