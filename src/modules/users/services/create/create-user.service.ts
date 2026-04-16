import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { CreateUserInputDto } from "../../dtos/create/create-user-input.dto";
import { CreateUserResponseDto } from "../../dtos/create/create-user-response.dto";
import { UserEntity } from "../../entities/user.entity";
import { ConflictException } from "@nestjs/common";
import { UserExistsValidator } from "../../validators/user-exists.validator";
import { AuthCredentialEntity } from "../../../auth/entities/auth-credential.entity";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { PasswordHasherService } from "../../../auth/services/password-hasher.service";
import type { IRequestInfo } from "../../../../common/decorators/request-info.decorator";

@Injectable()
export class CreateUserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly authorizationService: AuthorizationService,
    private readonly userExistsValidator: UserExistsValidator,
    private readonly passwordHasherService: PasswordHasherService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    currentUserId: string,
    input: CreateUserInputDto,
    requestInfo?: IRequestInfo,
  ): Promise<CreateUserResponseDto> {
    await this.authorizationService.assertPermissionForUserId(
      currentUserId,
      AuthPermission.MANAGE_USERS,
    );

    await this.userExistsValidator.ensureUserDoesNotExistByEmail(input.email);

    const temporaryPassword =
      this.passwordHasherService.generateTemporaryPassword();
    const passwordHash =
      await this.passwordHasherService.hashPassword(temporaryPassword);

    return this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(UserEntity);
      const authCredentialRepository =
        manager.getRepository(AuthCredentialEntity);

      const existingUsername = await authCredentialRepository.findOne({
        where: { username: input.username },
      });

      if (existingUsername) {
        throw new ConflictException("Username já está em uso.");
      }

      const user = userRepository.create({
        name: input.name,
        email: input.email,
        urlAvatar: input.urlAvatar,
        status: true,
        group: input.group,
        ipAddress: requestInfo?.ipAddress,
        userAgent: requestInfo?.userAgent,
      });

      const savedUser = await userRepository.save(user);

      const credential = authCredentialRepository.create({
        idUsers: savedUser.idUsers,
        username: input.username,
        passwordHash,
        mustChangePassword: true,
        temporaryPasswordCreatedAt: new Date(),
        failedLoginAttempts: 0,
      });

      await authCredentialRepository.save(credential);

      return {
        idUsers: savedUser.idUsers,
        name: savedUser.name,
        email: savedUser.email,
        username: credential.username,
        group: savedUser.group,
        temporaryPassword,
        mustChangePassword: credential.mustChangePassword,
        urlAvatar: savedUser.urlAvatar,
        status: savedUser.status,
        createdAt: savedUser.createdAt,
      };
    });
  }
}
