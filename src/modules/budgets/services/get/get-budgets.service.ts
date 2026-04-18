import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { GetBudgetsInputDto } from "../../dtos/get/get-budgets-input.dto";
import { GetBudgetsResponseDto } from "../../dtos/get/get-budgets-response.dto";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import { GetBudgetsValidator } from "../../validators/get/get-budgets.validator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";

@Injectable()
export class GetBudgetsService {
  constructor(
    @InjectRepository(BudgetsEntity)
    private readonly budgetsRepository: Repository<BudgetsEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async findAll(
    userId: string,
    input?: GetBudgetsInputDto,
  ): Promise<PaginatedResult<GetBudgetsResponseDto>> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.READ_BUDGETS,
    );

    const records = await GetBudgetsValidator.validateAndFetchRecords(
      userId,
      input ?? {},
      this.budgetsRepository,
    );

    return {
      ...records,
      items: records.items.map((record) =>
        GetBudgetsResponseDto.fromEntity(record),
      ),
    };
  }
}
