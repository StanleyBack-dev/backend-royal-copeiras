import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PageAccessKey } from "../../../auth/enums/page-access-key.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { GetSuppliesInputDto } from "../../dtos/get/get-supplies-input.dto";
import { GetSuppliesResponseDto } from "../../dtos/get/get-supplies-response.dto";
import { SuppliesEntity } from "../../entities/supplies.entity";
import { GetSuppliesValidator } from "../../validators/get/get-supplies.validator";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";

@Injectable()
export class GetSuppliesService {
  constructor(
    @InjectRepository(SuppliesEntity)
    private readonly suppliesRepository: Repository<SuppliesEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async findAll(
    userId: string,
    input?: GetSuppliesInputDto,
  ): Promise<PaginatedResult<GetSuppliesResponseDto>> {
    await this.authorizationService.assertPageAccessForUserId(
      userId,
      PageAccessKey.SUPPLIES,
    );

    const records = await GetSuppliesValidator.validateAndFetchRecords(
      input ?? {},
      this.suppliesRepository,
    );

    return {
      ...records,
      items: records.items.map((record) =>
        GetSuppliesResponseDto.fromEntity(record),
      ),
    };
  }
}
