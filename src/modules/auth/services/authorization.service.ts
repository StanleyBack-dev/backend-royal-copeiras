import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";
import { UserGroup } from "../../users/enums/user-group.enum";
import { GROUP_PERMISSIONS } from "../constants/group-permissions.constant";
import { AuthPermission } from "../enums/auth-permission.enum";

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async assertPermissionForUserId(
    userId: string,
    permission: AuthPermission,
  ): Promise<void> {
    await this.assertPermissionsForUserId(userId, [permission]);
  }

  async assertPermissionsForUserId(
    userId: string,
    permissions: AuthPermission[],
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { idUsers: userId },
    });

    if (!user) {
      throw new NotFoundException("Usuário autenticado não encontrado.");
    }

    this.assertPermissionsForGroup(user.group, permissions);
  }

  assertPermissionsForGroup(
    group: UserGroup,
    permissions: AuthPermission[],
  ): void {
    const grantedPermissions = new Set(GROUP_PERMISSIONS[group] ?? []);
    const missingPermission = permissions.find(
      (permission) => !grantedPermissions.has(permission),
    );

    if (missingPermission) {
      throw new ForbiddenException(
        `O grupo ${group} não possui a permissão ${missingPermission}.`,
      );
    }
  }
}
