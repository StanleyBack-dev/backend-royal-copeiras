import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EmployeesEntity } from "../../entities/employees.entity";
import { GetEmployeesInputDto } from "../../dtos/get/get-employees-input.dto";
import { GetEmployeesResponseDto } from "../../dtos/get/get-employees-response.dto";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import { GetEmployeesValidator } from "../../validators/get/get-employees.validator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";

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
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.READ_EMPLOYEES,
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
