import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppException } from "../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../common/exceptions/app-errors.catalog";
import { AuthCredentialEntity } from "../entities/auth-credential.entity";
import { UserEntity } from "../../users/entities/user.entity";

interface ProvisionCredentialInput {
  idUsers: string;
  username: string;
  passwordHash: string;
}

@Injectable()
export class AuthCredentialsService {
  constructor(
    @InjectRepository(AuthCredentialEntity)
    private readonly authCredentialRepository: Repository<AuthCredentialEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findByUsername(username: string): Promise<AuthCredentialEntity | null> {
    return this.authCredentialRepository.findOne({
      where: { username },
      relations: ["user"],
    });
  }

  async findByUserId(idUsers: string): Promise<AuthCredentialEntity | null> {
    return this.authCredentialRepository.findOne({
      where: { idUsers },
      relations: ["user"],
    });
  }

  async findByUserIdOrFail(idUsers: string): Promise<AuthCredentialEntity> {
    const credential = await this.findByUserId(idUsers);

    if (!credential) {
      throw AppException.from(
        APP_ERRORS.auth.credentialNotFoundForUser,
        undefined,
      );
    }

    return credential;
  }

  async provisionCredential(
    input: ProvisionCredentialInput,
  ): Promise<AuthCredentialEntity> {
    const user = await this.userRepository.findOne({
      where: { idUsers: input.idUsers },
    });

    if (!user) {
      throw AppException.from(
        APP_ERRORS.auth.credentialProvisionUserNotFound,
        undefined,
      );
    }

    const existingUserCredential = await this.findByUserId(input.idUsers);
    if (existingUserCredential) {
      throw AppException.from(
        APP_ERRORS.auth.credentialAlreadyExistsForUser,
        undefined,
      );
    }

    const existingUsername = await this.authCredentialRepository.findOne({
      where: { username: input.username },
    });
    if (existingUsername) {
      throw AppException.from(APP_ERRORS.auth.duplicateUsername, undefined);
    }

    const credential = this.authCredentialRepository.create({
      idUsers: input.idUsers,
      username: input.username,
      passwordHash: input.passwordHash,
      mustChangePassword: true,
      temporaryPasswordCreatedAt: new Date(),
      failedLoginAttempts: 0,
    });

    return this.authCredentialRepository.save(credential);
  }

  async ensureCredentialCanAuthenticate(
    credential: AuthCredentialEntity,
  ): Promise<void> {
    if (!credential.user.status || credential.user.inactivatedAt) {
      throw AppException.from(APP_ERRORS.auth.inactiveUser, undefined);
    }

    if (credential.lockUntil && credential.lockUntil > new Date()) {
      throw AppException.from(APP_ERRORS.auth.credentialLocked, undefined);
    }
  }

  async registerFailedLogin(credential: AuthCredentialEntity): Promise<void> {
    credential.failedLoginAttempts += 1;

    if (credential.failedLoginAttempts >= 5) {
      credential.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      credential.failedLoginAttempts = 0;
    }

    await this.authCredentialRepository.save(credential);
  }

  async registerSuccessfulLogin(
    credential: AuthCredentialEntity,
  ): Promise<void> {
    credential.failedLoginAttempts = 0;
    credential.lockUntil = undefined;
    credential.lastLoginAt = new Date();

    await this.authCredentialRepository.save(credential);
  }

  async updatePassword(
    credential: AuthCredentialEntity,
    passwordHash: string,
  ): Promise<AuthCredentialEntity> {
    credential.passwordHash = passwordHash;
    credential.mustChangePassword = false;
    credential.passwordChangedAt = new Date();
    credential.failedLoginAttempts = 0;
    credential.lockUntil = undefined;

    return this.authCredentialRepository.save(credential);
  }
}
