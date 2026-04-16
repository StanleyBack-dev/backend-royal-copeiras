import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { LoginService } from "../../services/login.service";
import { AuthCredentialsService } from "../../services/auth-credentials.service";
import { PasswordHasherService } from "../../services/password-hasher.service";
import { AuthTokensService } from "../../services/auth-tokens.service";
import { CreateSessionService } from "../../../sessions/services/create/create-session.service";
import { authCredentialMock } from "../../__mocks__/auth-credential.mock";

describe("LoginService", () => {
  let service: LoginService;
  let authCredentialsService: jest.Mocked<AuthCredentialsService>;
  let passwordHasherService: jest.Mocked<PasswordHasherService>;
  let createSessionService: jest.Mocked<CreateSessionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        {
          provide: AuthCredentialsService,
          useValue: {
            findByUsername: jest.fn().mockResolvedValue(authCredentialMock),
            ensureCredentialCanAuthenticate: jest
              .fn()
              .mockResolvedValue(undefined),
            registerFailedLogin: jest.fn().mockResolvedValue(undefined),
            registerSuccessfulLogin: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: PasswordHasherService,
          useValue: {
            verifyPassword: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: AuthTokensService,
          useValue: {
            signAccessToken: jest.fn().mockReturnValue("access-token"),
            signRefreshToken: jest.fn().mockReturnValue("refresh-token"),
            getRefreshTokenMaxAgeMs: jest
              .fn()
              .mockReturnValue(30 * 24 * 60 * 60 * 1000),
          },
        },
        {
          provide: CreateSessionService,
          useValue: {
            execute: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
    authCredentialsService = module.get(AuthCredentialsService);
    passwordHasherService = module.get(PasswordHasherService);
    createSessionService = module.get(CreateSessionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should authenticate and create session", async () => {
    const result = await service.execute(
      { username: "mock.user", password: "TempPassword123" },
      { ipAddress: "127.0.0.1", userAgent: "jest" },
    );

    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken).toBe("refresh-token");
    expect(result.response.user.username).toBe(authCredentialMock.username);
    expect(createSessionService.execute).toHaveBeenCalled();
    expect(authCredentialsService.registerSuccessfulLogin).toHaveBeenCalledWith(
      authCredentialMock,
    );
  });

  it("should reject invalid password", async () => {
    passwordHasherService.verifyPassword.mockResolvedValueOnce(false);

    await expect(
      service.execute(
        { username: "mock.user", password: "wrong-password" },
        { ipAddress: "127.0.0.1", userAgent: "jest" },
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(authCredentialsService.registerFailedLogin).toHaveBeenCalledWith(
      authCredentialMock,
    );
  });
});
