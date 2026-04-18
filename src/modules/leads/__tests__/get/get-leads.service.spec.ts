import { Test, TestingModule } from "@nestjs/testing";
import { GetLeadsService } from "../../services/get/get-leads.service";
import { leadMock } from "../../__mocks__/lead.mock";

describe("GetLeadsService", () => {
  let service: GetLeadsService;

  beforeAll(async () => {
    const serviceMock = {
      findAll: jest.fn().mockResolvedValue([leadMock]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: GetLeadsService, useValue: serviceMock }],
    }).compile();

    service = module.get<GetLeadsService>(GetLeadsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return a list of leads", async () => {
    const result = await service.findAll("user-id-test");
    expect(result).toEqual([leadMock]);
  });

  it("should return empty array if no leads", async () => {
    (service.findAll as jest.Mock).mockResolvedValueOnce([]);
    const result = await service.findAll("user-id-test");
    expect(result).toEqual([]);
  });
});
