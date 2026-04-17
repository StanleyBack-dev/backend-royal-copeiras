import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import {
  calculateHasNextPage,
  calculateTotalPages,
  resolvePagination,
} from "../../../../common/responses/helpers/pagination.helper";
import { CustomersEntity } from "../../entities/customers.entity";
import { GetCustomersInputDto } from "../../dtos/get/get-customers-input.dto";

export class GetCustomersValidator {
  static async validateAndFetchRecords(
    userId: string,
    input: GetCustomersInputDto,
    repo: Repository<CustomersEntity>,
  ): Promise<PaginatedResult<CustomersEntity>> {
    if (input.idCustomers) {
      const record = await repo.findOne({
        where: { idCustomers: input.idCustomers, idUsers: userId },
      });
      if (!record) {
        throw AppException.from(APP_ERRORS.customers.notFound, undefined);
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

    const { page, limit, skip } = resolvePagination(input.page, input.limit);

    const [records, total] = await repo.findAndCount({
      where: { idUsers: userId },
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
