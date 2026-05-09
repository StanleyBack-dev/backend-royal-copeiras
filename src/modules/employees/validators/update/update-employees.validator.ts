import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { EmployeesEntity } from "../../entities/employees.entity";
import { UpdateEmployeesInputDto } from "../../dtos/update/update-employees-input.dto";
import { EmployeesBaseValidator } from "../base/base-employees.validator";
import { PositionsEntity } from "../../../positions/entities/positions.entity";

export class UpdateEmployeesValidator extends EmployeesBaseValidator {
  static async validateAndUpdate(
    userId: string,
    input: UpdateEmployeesInputDto,
    employeesRepo: Repository<EmployeesEntity>,
    positionsRepo: Repository<PositionsEntity>,
  ): Promise<EmployeesEntity> {
    if (!input.idEmployees) {
      throw AppException.from(APP_ERRORS.employees.idRequired, undefined);
    }

    const record = await employeesRepo.findOne({
      where: { idEmployees: input.idEmployees },
      relations: { position: true },
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

    if (input.idPositions) {
      const position = await positionsRepo.findOne({
        where: { idPositions: input.idPositions },
      });

      if (!position) {
        throw AppException.from(APP_ERRORS.positions.notFound, undefined);
      }

      if (!position.isActive) {
        throw AppException.from(APP_ERRORS.positions.inactive, undefined);
      }

      record.idPositions = position.idPositions;
      record.position = position;
    }

    Object.assign(record, {
      ...input,
      idPositions: record.idPositions,
      position: record.position,
    });
    const saved = await employeesRepo.save(record);

    const withRelations = await employeesRepo.findOne({
      where: { idEmployees: saved.idEmployees },
      relations: { position: true },
    });

    return withRelations || saved;
  }
}
