import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { EmployeesEntity } from "../../entities/employees.entity";
import { GetEmployeesInputDto } from "../../dtos/get/get-employees-input.dto";

export class GetEmployeesValidator {
  static async validateAndFetchRecords(
    userId: string,
    input: GetEmployeesInputDto,
    repo: Repository<EmployeesEntity>,
  ): Promise<EmployeesEntity[]> {
    if (input.idEmployees) {
      const record = await repo.findOne({
        where: { idEmployees: input.idEmployees, idUsers: userId },
      });

      if (!record) {
        throw AppException.from(APP_ERRORS.employees.notFound, undefined);
      }

      return [record];
    }

    const where: FindOptionsWhere<EmployeesEntity> = { idUsers: userId };

    if (input.startDate && input.endDate) {
      where.createdAt = Between(
        new Date(input.startDate),
        new Date(input.endDate),
      );
    } else if (input.startDate) {
      where.createdAt = MoreThanOrEqual(new Date(input.startDate));
    } else if (input.endDate) {
      where.createdAt = LessThanOrEqual(new Date(input.endDate));
    }

    const records = await repo.find({
      where,
      order: { createdAt: "DESC" },
    });

    if (!records.length) {
      throw AppException.from(APP_ERRORS.employees.noneFound, undefined);
    }

    return records;
  }
}
