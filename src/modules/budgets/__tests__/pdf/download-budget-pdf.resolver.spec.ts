import { Test, TestingModule } from "@nestjs/testing";
import { DownloadBudgetPdfResolver } from "../../resolvers/pdf/download-budget-pdf.resolver";
import { DownloadBudgetPdfService } from "../../services/pdf/download-budget-pdf.service";

describe("DownloadBudgetPdfResolver", () => {
  let resolver: DownloadBudgetPdfResolver;
  let service: DownloadBudgetPdfService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadBudgetPdfResolver,
        { provide: DownloadBudgetPdfService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<DownloadBudgetPdfResolver>(DownloadBudgetPdfResolver);
    service = module.get<DownloadBudgetPdfService>(DownloadBudgetPdfService);
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

    const result = await resolver.downloadBudgetPdf(fakeUser, input);

    expect(service.execute).toHaveBeenCalledWith(fakeUser.idUsers, input);
    expect(result).toHaveProperty("data");
    expect(result.data).toMatchObject(mockResult);
  });
});
