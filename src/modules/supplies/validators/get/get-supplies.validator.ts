import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import {
  calculateHasNextPage,
  calculateTotalPages,
  resolvePagination,
} from "../../../../common/responses/helpers/pagination.helper";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import { GetSuppliesInputDto } from "../../dtos/get/get-supplies-input.dto";
import { SuppliesEntity } from "../../entities/supplies.entity";

export class GetSuppliesValidator {
  static async validateAndFetchRecords(
    input: GetSuppliesInputDto,
    suppliesRepo: Repository<SuppliesEntity>,
  ): Promise<PaginatedResult<SuppliesEntity>> {
    if (input.idSupplies) {
      const record = await suppliesRepo.findOne({
        where: { idSupplies: input.idSupplies },
      });

      if (!record) {
        throw AppException.from(APP_ERRORS.supplies.notFound, undefined);
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

    const where: FindOptionsWhere<SuppliesEntity> = {};

    if (typeof input.isActive === "boolean") {
      where.isActive = input.isActive;
    }

    if (input.search?.trim()) {
      where.name = ILike(`%${input.search.trim()}%`);
    }

    const { page, limit, skip } = resolvePagination(input.page, input.limit);

    const [records, total] = await suppliesRepo.findAndCount({
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
