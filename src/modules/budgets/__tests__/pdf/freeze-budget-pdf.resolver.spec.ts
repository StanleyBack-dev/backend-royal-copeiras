import { Test, TestingModule } from "@nestjs/testing";
import { FreezeBudgetPdfResolver } from "../../resolvers/pdf/freeze-budget-pdf.resolver";
import { FreezeBudgetPdfService } from "../../services/pdf/freeze-budget-pdf.service";

describe("FreezeBudgetPdfResolver", () => {
  let resolver: FreezeBudgetPdfResolver;
  let service: FreezeBudgetPdfService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FreezeBudgetPdfResolver,
        { provide: FreezeBudgetPdfService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<FreezeBudgetPdfResolver>(FreezeBudgetPdfResolver);
    service = module.get<FreezeBudgetPdfService>(FreezeBudgetPdfService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });

  it("should call service.execute and return data response", async () => {
    const mockResult = {
      fileName: "ORC-001.pdf",
      mimeType: "application/pdf",
      base64Content: "base64==",
      snapshotHash: "abc123",
      frozenAt: new Date().toISOString(),
    };

    jest.spyOn(service, "execute").mockResolvedValue(mockResult);

    const fakeUser = { idUsers: "user-uuid" };
    const input = { idBudgets: "budget-uuid" };

    const result = await resolver.freezeBudgetPdf(fakeUser, input);

    expect(service.execute).toHaveBeenCalledWith(fakeUser.idUsers, input);
    expect(result).toHaveProperty("data");
    expect(result.data).toMatchObject(mockResult);
  });
});
