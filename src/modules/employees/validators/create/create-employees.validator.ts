import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { EmployeesEntity } from "../../entities/employees.entity";
import { EmployeesBaseValidator } from "../base/base-employees.validator";
import { CreateEmployeesInputDto } from "../../dtos/create/create-employees-input.dto";
import { PositionsEntity } from "../../../positions/entities/positions.entity";

export class CreateEmployeesValidator extends EmployeesBaseValidator {
  static async validateAndCreate(
    userId: string,
    input: CreateEmployeesInputDto,
    employeesRepo: Repository<EmployeesEntity>,
    positionsRepo: Repository<PositionsEntity>,
  ): Promise<EmployeesEntity> {
    const normalizedDocument = input.document?.trim();

    if (normalizedDocument) {
      this.validateDocument(normalizedDocument);

      const existing = await employeesRepo.findOne({
        where: { document: normalizedDocument },
      });

      if (existing) {
        throw AppException.from(
          APP_ERRORS.employees.duplicateDocument,
          undefined,
        );
      }
    }

    const position = await positionsRepo.findOne({
      where: { idPositions: input.idPositions },
    });

    if (!position) {
      throw AppException.from(APP_ERRORS.positions.notFound, undefined);
    }

    if (!position.isActive) {
      throw AppException.from(APP_ERRORS.positions.inactive, undefined);
    }

    const newRecord = employeesRepo.create({
      idUsers: userId,
      name: input.name,
      gender: input.gender,
      document: normalizedDocument || null,
      email: input.email,
      phone: input.phone,
      idPositions: input.idPositions,
      isActive: input.isActive,
    });
    const saved = await employeesRepo.save(newRecord);

    const withRelations = await employeesRepo.findOne({
      where: { idEmployees: saved.idEmployees },
      relations: { position: true },
    });

    return withRelations || saved;
  }
}
