import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../../entities/user.entity";
import { GetUserInputDto } from "../../dtos/get/get-user-input.dto";
import { GetUserValidator } from "../../validators/get/get-user.validator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";

@Injectable()
export class GetUsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async findOne(userId: string, input: GetUserInputDto) {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.READ_USERS,
    );

    GetUserValidator.ensureValidInput(input);

    const where = input.idUsers
      ? { idUsers: input.idUsers }
      : { email: input.email };

    const user = await this.repo.findOne({ where });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    return user;
  }

  async findAll(userId: string) {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.READ_USERS,
    );

    return this.repo.find({ order: { createdAt: "DESC" } });
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findById(idUsers: string) {
    return this.repo.findOne({ where: { idUsers } });
  }

  async findByIdOrFail(idUsers: string) {
    await this.authorizationService.assertPermissionForUserId(
      idUsers,
      AuthPermission.READ_OWN_USER,
    );

    const user = await this.findById(idUsers);

    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    return user;
  }
}
