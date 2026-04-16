import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { EmployeesEntity } from "../../entities/employees.entity";
import { EmployeesBaseValidator } from "../base/base-employees.validator";
import { CreateEmployeesInputDto } from "../../dtos/create/create-employees-input.dto";

export class CreateEmployeesValidator extends EmployeesBaseValidator {
  static async validateAndCreate(
    userId: string,
    input: CreateEmployeesInputDto,
    employeesRepo: Repository<EmployeesEntity>,
  ): Promise<EmployeesEntity> {
    this.validateDocument(input.document);

    const existing = await employeesRepo.findOne({
      where: { document: input.document },
    });

    if (existing) {
      throw AppException.from(
        APP_ERRORS.employees.duplicateDocument,
        undefined,
      );
    }

    const newRecord = employeesRepo.create({
      idUsers: userId,
      name: input.name,
      document: input.document,
      email: input.email,
      phone: input.phone,
      position: input.position,
      isActive: input.isActive,
    });

    return employeesRepo.save(newRecord);
  }
}
