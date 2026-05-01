import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { EmployeesEntity } from "../../entities/employees.entity";
import { UpdateEmployeesInputDto } from "../../dtos/update/update-employees-input.dto";
import { EmployeesBaseValidator } from "../base/base-employees.validator";

export class UpdateEmployeesValidator extends EmployeesBaseValidator {
  static async validateAndUpdate(
    userId: string,
    input: UpdateEmployeesInputDto,
    employeesRepo: Repository<EmployeesEntity>,
  ): Promise<EmployeesEntity> {
    if (!input.idEmployees) {
      throw AppException.from(APP_ERRORS.employees.idRequired, undefined);
    }

    const record = await employeesRepo.findOne({
      where: { idEmployees: input.idEmployees },
    });

    if (!record) {
      throw AppException.from(APP_ERRORS.employees.notFound, undefined);
    }

    const normalizedDocument = input.document?.trim();

    if (normalizedDocument && normalizedDocument !== record.document) {
      const existing = await employeesRepo.findOne({
        where: { document: normalizedDocument },
      });

      if (existing) {
        throw AppException.from(
          APP_ERRORS.employees.duplicateDocument,
          undefined,
        );
      }

      this.validateDocument(normalizedDocument);
    }

    if (input.document !== undefined) {
      input.document = normalizedDocument || undefined;
    }

    Object.assign(record, input);

    return employeesRepo.save(record);
  }
}
