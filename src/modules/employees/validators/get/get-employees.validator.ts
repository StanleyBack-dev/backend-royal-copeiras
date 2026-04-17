import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import {
  calculateHasNextPage,
  calculateTotalPages,
  resolvePagination,
} from "../../../../common/responses/helpers/pagination.helper";
import { EmployeesEntity } from "../../entities/employees.entity";
import { GetEmployeesInputDto } from "../../dtos/get/get-employees-input.dto";

export class GetEmployeesValidator {
  static async validateAndFetchRecords(
    userId: string,
    input: GetEmployeesInputDto,
    repo: Repository<EmployeesEntity>,
  ): Promise<PaginatedResult<EmployeesEntity>> {
    if (input.idEmployees) {
      const record = await repo.findOne({
        where: { idEmployees: input.idEmployees, idUsers: userId },
      });

      if (!record) {
        throw AppException.from(APP_ERRORS.employees.notFound, undefined);
      }

      return {
        items: [record],
        total: 1,
        currentPage: 1,
        limit: 1,
        totalPages: 1,
        hasNextPage: false,
      };
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

    const { page, limit, skip } = resolvePagination(input.page, input.limit);

    const [records, total] = await repo.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    return {
      items: records,
      total,
      currentPage: page,
      limit,
      totalPages: calculateTotalPages(limit, total),
      hasNextPage: calculateHasNextPage(page, limit, total),
    };
  }
}
