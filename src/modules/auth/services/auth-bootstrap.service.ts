import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";
import { UserGroup } from "../../users/enums/user-group.enum";
import { AuthCredentialEntity } from "../entities/auth-credential.entity";
import { PasswordHasherService } from "./password-hasher.service";

@Injectable()
export class AuthBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthBootstrapService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly passwordHasherService: PasswordHasherService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AuthCredentialEntity)
    private readonly authCredentialRepository: Repository<AuthCredentialEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.bootstrapAdminMaster();
  }

  async bootstrapAdminMaster(): Promise<void> {
    if (!this.isBootstrapEnabled()) {
      return;
    }

    const existingAdminMaster = await this.userRepository.findOne({
      where: { group: UserGroup.ADMIN_MASTER },
    });

    if (existingAdminMaster) {
      return;
    }

    const config = this.getBootstrapConfig();

    const existingEmail = await this.userRepository.findOne({
      where: { email: config.email },
    });
    if (existingEmail) {
      throw new Error(
        "Nao foi possivel criar o ADMIN_MASTER inicial: e-mail ja esta em uso.",
      );
    }

    const existingUsername = await this.authCredentialRepository.findOne({
      where: { username: config.username },
    });
    if (existingUsername) {
      throw new Error(
        "Nao foi possivel criar o ADMIN_MASTER inicial: username ja esta em uso.",
      );
    }

    const passwordHash = await this.passwordHasherService.hashPassword(
      config.password,
    );

    await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(UserEntity);
      const authCredentialRepository =
        manager.getRepository(AuthCredentialEntity);

      const user = userRepository.create({
        name: config.name,
        email: config.email,
        status: true,
        group: UserGroup.ADMIN_MASTER,
      });

      const savedUser = await userRepository.save(user);

      const credential = authCredentialRepository.create({
        idUsers: savedUser.idUsers,
        username: config.username,
        passwordHash,
        mustChangePassword: false,
        passwordChangedAt: new Date(),
        failedLoginAttempts: 0,
      });

      await authCredentialRepository.save(credential);
    });

    this.logger.warn(
      `ADMIN_MASTER inicial criado automaticamente para ${config.email}.`,
    );
  }

  private isBootstrapEnabled(): boolean {
    return (
      this.configService.get<boolean>("BOOTSTRAP_ADMIN_MASTER_ENABLED") === true
    );
  }

  private getBootstrapConfig() {
    const name = this.configService.get<string>("BOOTSTRAP_ADMIN_MASTER_NAME");
    const email = this.configService.get<string>(
      "BOOTSTRAP_ADMIN_MASTER_EMAIL",
    );
    const username = this.configService.get<string>(
      "BOOTSTRAP_ADMIN_MASTER_USERNAME",
    );
    const password = this.configService.get<string>(
      "BOOTSTRAP_ADMIN_MASTER_PASSWORD",
    );

    if (!name || !email || !username || !password) {
      throw new Error(
        "Configuracao incompleta para bootstrap do ADMIN_MASTER inicial.",
      );
    }

    return {
      name,
      email,
      username,
      password,
    };
  }
}
