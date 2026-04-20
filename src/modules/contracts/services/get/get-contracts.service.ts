import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import { ContractsEntity } from "../../entities/contracts.entity";
import { GetContractsInputDto } from "../../dtos/get/get-contracts-input.dto";
import { GetContractsResponseDto } from "../../dtos/get/get-contracts-response.dto";
import { GetContractsValidator } from "../../validators/get/get-contracts.validator";

@Injectable()
export class GetContractsService {
  constructor(
    @InjectRepository(ContractsEntity)
    private readonly contractsRepository: Repository<ContractsEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async findAll(
    userId: string,
    input?: GetContractsInputDto,
  ): Promise<PaginatedResult<GetContractsResponseDto>> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.READ_BUDGETS,
    );

    const records = await GetContractsValidator.validateAndFetchRecords(
      userId,
      input ?? {},
      this.contractsRepository,
    );

    return {
      ...records,
      items: records.items.map((record) =>
        GetContractsResponseDto.fromEntity(record),
      ),
    };
  }
}
