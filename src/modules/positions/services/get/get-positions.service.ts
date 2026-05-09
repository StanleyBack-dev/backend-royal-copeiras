import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PageAccessKey } from "../../../auth/enums/page-access-key.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { GetPositionsInputDto } from "../../dtos/get/get-positions-input.dto";
import { GetPositionsResponseDto } from "../../dtos/get/get-positions-response.dto";
import { PositionsEntity } from "../../entities/positions.entity";
import { GetPositionsValidator } from "../../validators/get/get-positions.validator";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";

@Injectable()
export class GetPositionsService {
  constructor(
    @InjectRepository(PositionsEntity)
    private readonly positionsRepository: Repository<PositionsEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async findAll(
    userId: string,
    input?: GetPositionsInputDto,
  ): Promise<PaginatedResult<GetPositionsResponseDto>> {
    await this.authorizationService.assertPageAccessForUserId(
      userId,
      PageAccessKey.POSITIONS,
    );

    const records = await GetPositionsValidator.validateAndFetchRecords(
      input ?? {},
      this.positionsRepository,
    );

    return {
      ...records,
      items: records.items.map((record) =>
        GetPositionsResponseDto.fromEntity(record),
      ),
    };
  }
}
