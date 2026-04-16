import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import { AuthBootstrapService } from "../../services/auth-bootstrap.service";
import { PasswordHasherService } from "../../services/password-hasher.service";
import { UserEntity } from "../../../users/entities/user.entity";
import { AuthCredentialEntity } from "../../entities/auth-credential.entity";
import { UserGroup } from "../../../users/enums/user-group.enum";

describe("AuthBootstrapService", () => {
  let service: AuthBootstrapService;
  let userRepository: { findOne: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        const savedUser = {
          idUsers: "admin-master-id",
          name: "Admin Master",
          email: "admin.master@royalcopeiras.com",
          status: true,
          group: UserGroup.ADMIN_MASTER,
        };

        const userRepo = {
          create: jest.fn((value) => value),
          save: jest.fn().mockResolvedValue(savedUser),
        };
        const credentialRepo = {
          create: jest.fn((value) => value),
          save: jest.fn().mockResolvedValue(undefined),
        };

        return callback({
          getRepository: jest.fn((entity) =>
            entity === UserEntity ? userRepo : credentialRepo,
          ),
        });
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthBootstrapService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const values: Record<string, unknown> = {
                BOOTSTRAP_ADMIN_MASTER_ENABLED: true,
                BOOTSTRAP_ADMIN_MASTER_NAME: "Admin Master",
                BOOTSTRAP_ADMIN_MASTER_EMAIL: "admin.master@royalcopeiras.com",
                BOOTSTRAP_ADMIN_MASTER_USERNAME: "admin.master",
                BOOTSTRAP_ADMIN_MASTER_PASSWORD: "AdminMaster123!",
              };

              return values[key];
            }),
          },
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: PasswordHasherService,
          useValue: {
            hashPassword: jest.fn().mockResolvedValue("bootstrap-hash"),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(AuthCredentialEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<AuthBootstrapService>(AuthBootstrapService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create initial admin master when enabled and missing", async () => {
    await service.bootstrapAdminMaster();

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { group: UserGroup.ADMIN_MASTER },
    });
    expect(dataSource.transaction).toHaveBeenCalled();
  });

  it("should skip bootstrap when admin master already exists", async () => {
    userRepository.findOne.mockResolvedValueOnce({
      idUsers: "existing-admin-master",
    });

    await service.bootstrapAdminMaster();

    expect(dataSource.transaction).not.toHaveBeenCalled();
  });
});
