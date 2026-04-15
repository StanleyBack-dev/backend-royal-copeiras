import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EmployeesEntity } from "../../entities/employees.entity";
import { CreateEmployeesInputDto } from "../../dtos/create/create-employees-input.dto";
import { CreateEmployeesResponseDto } from "../../dtos/create/create-employees-response.dto";
import { IEmployee } from "../../interface/employee.interface";
import { CreateEmployeesValidator } from "../../validators/create/create-employees.validator";

@Injectable()
export class CreateEmployeesService {
  constructor(
    @InjectRepository(EmployeesEntity)
    private readonly employeesRepository: Repository<EmployeesEntity>,
  ) {}

  async execute(
    userId: string,
    input: CreateEmployeesInputDto,
  ): Promise<IEmployee> {
    const saved = await CreateEmployeesValidator.validateAndCreate(
      userId,
      input,
      this.employeesRepository,
    );

    return CreateEmployeesResponseDto.fromEntity(saved);
  }
}
