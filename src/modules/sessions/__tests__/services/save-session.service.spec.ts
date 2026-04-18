import { Test, TestingModule } from "@nestjs/testing";
import { SaveSessionService } from "../../services/save/save-session.service";
import { sessionMock } from "../../__mocks__/session.mock";

describe("SaveSessionService", () => {
  let service: SaveSessionService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn().mockResolvedValue(sessionMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: SaveSessionService, useValue: serviceMock }],
    }).compile();

    service = module.get<SaveSessionService>(SaveSessionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should save a session", async () => {
    const result = await service.execute(sessionMock);
    expect(result).toEqual(sessionMock);
  });
});
