import { Test, TestingModule } from "@nestjs/testing";
import { RefreshSessionService } from "../../services/refresh/refresh-session.service";
import { SaveSessionService } from "../../services/save/save-session.service";
import { sessionMock } from "../../__mocks__/session.mock";

describe("RefreshSessionService", () => {
  let service: RefreshSessionService;
  let saveSessionService: SaveSessionService;

  beforeAll(async () => {
    const saveSessionServiceMock = {
      execute: jest.fn().mockResolvedValue(sessionMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshSessionService,
        { provide: SaveSessionService, useValue: saveSessionServiceMock },
      ],
    }).compile();

    service = module.get<RefreshSessionService>(RefreshSessionService);
    saveSessionService = module.get<SaveSessionService>(SaveSessionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(saveSessionService).toBeDefined();
  });

  it("should refresh a valid session", async () => {
    await service.execute({
      ...sessionMock,
      refreshTokenExpiresAt: new Date("2099-12-31T00:00:00Z"),
    });

    expect(saveSessionService.execute).toHaveBeenCalledTimes(1);
  });

  it("should throw when session is expired", async () => {
    await expect(
      service.execute({
        ...sessionMock,
        refreshTokenExpiresAt: new Date("2000-01-01T00:00:00Z"),
      }),
    ).rejects.toThrow();
  });
});
