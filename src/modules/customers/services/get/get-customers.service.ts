import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CustomersEntity } from "../../entities/customers.entity";
import { GetCustomersInputDto } from "../../dtos/get/get-customers-input.dto";
import { GetCustomersResponseDto } from "../../dtos/get/get-customers-response.dto";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import { GetCustomersValidator } from "../../validators/get/get-customers.validator";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { PageAccessKey } from "../../../auth/enums/page-access-key.enum";

@Injectable()
export class GetCustomersService {
  constructor(
    @InjectRepository(CustomersEntity)
    private readonly customersRepository: Repository<CustomersEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async findAll(
    userId: string,
    input?: GetCustomersInputDto,
  ): Promise<PaginatedResult<GetCustomersResponseDto>> {
    await this.authorizationService.assertPageAccessForUserId(
      userId,
      PageAccessKey.CLIENTS,
    );
    const records = await GetCustomersValidator.validateAndFetchRecords(
      userId,
      input ?? {},
      this.customersRepository,
    );

    return {
      ...records,
      items: records.items.map((record) =>
        GetCustomersResponseDto.fromEntity(record),
      ),
    };
  }
}
