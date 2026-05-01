import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EmployeesEntity } from "../../entities/employees.entity";
import { GetEmployeesInputDto } from "../../dtos/get/get-employees-input.dto";
import { GetEmployeesResponseDto } from "../../dtos/get/get-employees-response.dto";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import { GetEmployeesValidator } from "../../validators/get/get-employees.validator";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { PageAccessKey } from "../../../auth/enums/page-access-key.enum";

@Injectable()
export class GetEmployeesService {
  constructor(
    @InjectRepository(EmployeesEntity)
    private readonly employeesRepository: Repository<EmployeesEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async findAll(
    userId: string,
    input?: GetEmployeesInputDto,
  ): Promise<PaginatedResult<GetEmployeesResponseDto>> {
    await this.authorizationService.assertPageAccessForUserId(
      userId,
      PageAccessKey.EMPLOYEES,
    );

    const records = await GetEmployeesValidator.validateAndFetchRecords(
      userId,
      input ?? {},
      this.employeesRepository,
    );

    return {
      ...records,
      items: records.items.map((record) =>
        GetEmployeesResponseDto.fromEntity(record),
      ),
    };
  }
}
