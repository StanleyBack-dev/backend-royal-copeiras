import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { ChangePasswordService } from "../../services/change-password.service";
import { AuthCredentialsService } from "../../services/auth-credentials.service";
import { AuthorizationService } from "../../services/authorization.service";
import { PasswordHasherService } from "../../services/password-hasher.service";
import { authCredentialMock } from "../../__mocks__/auth-credential.mock";

describe("ChangePasswordService", () => {
  let service: ChangePasswordService;
  let authCredentialsService: jest.Mocked<AuthCredentialsService>;
  let passwordHasherService: jest.Mocked<PasswordHasherService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordService,
        {
          provide: AuthCredentialsService,
          useValue: {
            findByUserIdOrFail: jest.fn().mockResolvedValue(authCredentialMock),
            updatePassword: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: AuthorizationService,
          useValue: {
            assertPermissionForUserId: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: PasswordHasherService,
          useValue: {
            verifyPassword: jest.fn().mockResolvedValue(true),
            hashPassword: jest.fn().mockResolvedValue("new-hash"),
          },
        },
      ],
    }).compile();

    service = module.get<ChangePasswordService>(ChangePasswordService);
    authCredentialsService = module.get(AuthCredentialsService);
    passwordHasherService = module.get(PasswordHasherService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should update password on first access", async () => {
    await service.execute(authCredentialMock.idUsers, {
      currentPassword: "TempPassword123",
      newPassword: "NewPassword456",
    });

    expect(passwordHasherService.hashPassword).toHaveBeenCalledWith(
      "NewPassword456",
    );
    expect(authCredentialsService.updatePassword).toHaveBeenCalledWith(
      authCredentialMock,
      "new-hash",
    );
  });

  it("should reject same password", async () => {
    await expect(
      service.execute(authCredentialMock.idUsers, {
        currentPassword: "same-password",
        newPassword: "same-password",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("should reject invalid current password", async () => {
    passwordHasherService.verifyPassword.mockResolvedValueOnce(false);

    await expect(
      service.execute(authCredentialMock.idUsers, {
        currentPassword: "wrong-password",
        newPassword: "NewPassword456",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
