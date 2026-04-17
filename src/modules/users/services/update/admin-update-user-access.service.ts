import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { UserEntity } from "../../entities/user.entity";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { AdminUpdateUserAccessInputDto } from "../../dtos/update/admin-update-user-access-input.dto";
import { AdminUpdateUserAccessResponseDto } from "../../dtos/update/admin-update-user-access-response.dto";

@Injectable()
export class AdminUpdateUserAccessService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    currentUserId: string,
    input: AdminUpdateUserAccessInputDto,
  ): Promise<AdminUpdateUserAccessResponseDto> {
    await this.authorizationService.assertPermissionForUserId(
      currentUserId,
      AuthPermission.MANAGE_USERS,
    );

    if (input.group === undefined && input.status === undefined) {
      throw AppException.from(APP_ERRORS.users.invalidUpdateInput, undefined);
    }

    const user = await this.repo.findOne({
      where: { idUsers: input.idUsers },
    });

    if (!user) {
      throw AppException.from(APP_ERRORS.users.notFound, undefined);
    }

    if (input.group !== undefined) {
      user.group = input.group;
    }

    if (input.status !== undefined) {
      user.status = input.status;
      user.inactivatedAt = input.status ? undefined : new Date();
    }

    const updated = await this.repo.save(user);

    return {
      idUsers: updated.idUsers,
      group: updated.group,
      status: updated.status,
      inactivatedAt: updated.inactivatedAt,
      updatedAt: updated.updatedAt,
    };
  }
}