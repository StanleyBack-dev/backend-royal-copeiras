import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { AuthCredentialEntity } from "../../../auth/entities/auth-credential.entity";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { UnlockUserCredentialInputDto } from "../../dtos/update/unlock-user-credential-input.dto";
import { UnlockUserCredentialResponseDto } from "../../dtos/update/unlock-user-credential-response.dto";

@Injectable()
export class UnlockUserCredentialService {
  constructor(
    @InjectRepository(AuthCredentialEntity)
    private readonly authCredentialRepository: Repository<AuthCredentialEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    currentUserId: string,
    input: UnlockUserCredentialInputDto,
  ): Promise<UnlockUserCredentialResponseDto> {
    await this.authorizationService.assertPermissionForUserId(
      currentUserId,
      AuthPermission.MANAGE_USERS,
    );

    const credential = await this.authCredentialRepository.findOne({
      where: { idUsers: input.idUsers },
    });

    if (!credential) {
      throw AppException.from(APP_ERRORS.users.notFound, undefined);
    }

    await this.authCredentialRepository.update(
      { idAuthCredentials: credential.idAuthCredentials },
      {
        failedLoginAttempts: 0,
        lockUntil: null,
      },
    );

    const updated = await this.authCredentialRepository.findOne({
      where: { idAuthCredentials: credential.idAuthCredentials },
    });

    return {
      idUsers: input.idUsers,
      updatedAt: updated!.updatedAt,
    };
  }
}
