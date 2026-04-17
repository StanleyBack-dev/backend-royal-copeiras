import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import {
  calculateHasNextPage,
  calculateTotalPages,
  resolvePagination,
} from "../../../../common/responses/helpers/pagination.helper";
import { UserEntity } from "../../entities/user.entity";
import { GetUserInputDto } from "../../dtos/get/get-user-input.dto";
import { GetUserResponseDto } from "../../dtos/get/get-user-response.dto";
import { GetUsersInputDto } from "../../dtos/get/get-users-input.dto";
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
      throw AppException.from(APP_ERRORS.users.notFound, undefined);
    }

    return user;
  }

  async findAll(
    userId: string,
    input?: GetUsersInputDto,
  ): Promise<PaginatedResult<GetUserResponseDto>> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.READ_USERS,
    );

    const { page, limit, skip } = resolvePagination(input?.page, input?.limit);
    const [records, total] = await this.repo.findAndCount({
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    return {
      items: records.map((record) => GetUserResponseDto.fromEntity(record)),
      total,
      currentPage: page,
      limit,
      totalPages: calculateTotalPages(limit, total),
      hasNextPage: calculateHasNextPage(page, limit, total),
    };
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
      throw AppException.from(APP_ERRORS.users.notFound, undefined);
    }

    return user;
  }
}
