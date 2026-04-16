import { Test, TestingModule } from "@nestjs/testing";
import { AuthResolver } from "../../resolvers/auth.resolver";
import { LoginService } from "../../services/login.service";
import { RefreshAuthSessionService } from "../../services/refresh-auth-session.service";
import { LogoutService } from "../../services/logout.service";
import { ChangePasswordService } from "../../services/change-password.service";
import { AuthCookieService } from "../../services/auth-cookie.service";
import { authCredentialMock } from "../../__mocks__/auth-credential.mock";

describe("AuthResolver", () => {
  let resolver: AuthResolver;
  let loginService: jest.Mocked<LoginService>;
  let changePasswordService: jest.Mocked<ChangePasswordService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: LoginService,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              accessToken: "access-token",
              refreshToken: "refresh-token",
              response: {
                authenticated: true,
                mustChangePassword: true,
                user: {
                  idUsers: authCredentialMock.idUsers,
                  name: authCredentialMock.user.name,
                  email: authCredentialMock.user.email,
                  username: authCredentialMock.username,
                  group: authCredentialMock.user.group,
                  status: authCredentialMock.user.status,
                  urlAvatar: authCredentialMock.user.urlAvatar,
                },
              },
            }),
          },
        },
        {
          provide: RefreshAuthSessionService,
          useValue: { execute: jest.fn() },
        },
        {
          provide: LogoutService,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ChangePasswordService,
          useValue: { execute: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: AuthCookieService,
          useValue: {
            setAuthCookies: jest.fn(),
            clearAuthCookies: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    loginService = module.get(LoginService);
    changePasswordService = module.get(ChangePasswordService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
  });

  it("should delegate login", async () => {
    const result = await resolver.login(
      { username: "mock.user", password: "TempPassword123" },
      {
        req: {
          headers: { "user-agent": "jest" },
          socket: { remoteAddress: "127.0.0.1" },
        } as never,
        res: {} as never,
      },
    );

    expect(result.authenticated).toBe(true);
    expect(loginService.execute).toHaveBeenCalled();
  });

  it("should delegate password change", async () => {
    const result = await resolver.changeMyPassword(
      {
        idUsers: authCredentialMock.idUsers,
        username: authCredentialMock.username,
        group: authCredentialMock.user.group,
      },
      {
        currentPassword: "TempPassword123",
        newPassword: "NewPassword456",
      },
    );

    expect(result.success).toBe(true);
    expect(changePasswordService.execute).toHaveBeenCalledWith(
      authCredentialMock.idUsers,
      {
        currentPassword: "TempPassword123",
        newPassword: "NewPassword456",
      },
    );
  });
});
