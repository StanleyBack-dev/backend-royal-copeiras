import { Test, TestingModule } from "@nestjs/testing";
import { GenerateBudgetPreviewResolver } from "../../resolvers/pdf/generate-budget-preview.resolver";
import { GenerateBudgetPreviewPdfService } from "../../services/pdf/generate-budget-preview-pdf.service";

describe("GenerateBudgetPreviewResolver", () => {
  let resolver: GenerateBudgetPreviewResolver;
  let service: GenerateBudgetPreviewPdfService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateBudgetPreviewResolver,
        { provide: GenerateBudgetPreviewPdfService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<GenerateBudgetPreviewResolver>(
      GenerateBudgetPreviewResolver,
    );
    service = module.get<GenerateBudgetPreviewPdfService>(
      GenerateBudgetPreviewPdfService,
    );
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });
});
