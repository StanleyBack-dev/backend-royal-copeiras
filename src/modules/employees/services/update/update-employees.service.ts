import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EmployeesEntity } from "../../entities/employees.entity";
import { UpdateEmployeesInputDto } from "../../dtos/update/update-employees-input.dto";
import { UpdateEmployeesResponseDto } from "../../dtos/update/update-employees-response.dto";
import { IEmployee } from "../../interface/employee.interface";
import { UpdateEmployeesValidator } from "../../validators/update/update-employees.validator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";

@Injectable()
export class UpdateEmployeesService {
  constructor(
    @InjectRepository(EmployeesEntity)
    private readonly employeesRepository: Repository<EmployeesEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    userId: string,
    input: UpdateEmployeesInputDto,
  ): Promise<IEmployee> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_EMPLOYEES,
    );

    const updated = await UpdateEmployeesValidator.validateAndUpdate(
      userId,
      input,
      this.employeesRepository,
    );

    return UpdateEmployeesResponseDto.fromEntity(updated);
  }
}
