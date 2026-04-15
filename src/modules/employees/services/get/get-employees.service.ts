import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EmployeesEntity } from "../../entities/employees.entity";
import { GetEmployeesInputDto } from "../../dtos/get/get-employees-input.dto";
import { GetEmployeesResponseDto } from "../../dtos/get/get-employees-response.dto";
import { IEmployee } from "../../interface/employee.interface";
import { GetEmployeesValidator } from "../../validators/get/get-employees.validator";

@Injectable()
export class GetEmployeesService {
  constructor(
    @InjectRepository(EmployeesEntity)
    private readonly employeesRepository: Repository<EmployeesEntity>,
  ) {}

  async findAll(
    userId: string,
    input?: GetEmployeesInputDto,
  ): Promise<IEmployee[]> {
    const records = await GetEmployeesValidator.validateAndFetchRecords(
      userId,
      input ?? {},
      this.employeesRepository,
    );

    return records.map((record) => GetEmployeesResponseDto.fromEntity(record));
  }
}
