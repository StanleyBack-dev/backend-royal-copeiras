import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import {
  calculateHasNextPage,
  calculateTotalPages,
  resolvePagination,
} from "../../../../common/responses/helpers/pagination.helper";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import { GetPositionsInputDto } from "../../dtos/get/get-positions-input.dto";
import { PositionsEntity } from "../../entities/positions.entity";

export class GetPositionsValidator {
  static async validateAndFetchRecords(
    input: GetPositionsInputDto,
    positionsRepo: Repository<PositionsEntity>,
  ): Promise<PaginatedResult<PositionsEntity>> {
    if (input.idPositions) {
      const record = await positionsRepo.findOne({
        where: { idPositions: input.idPositions },
      });

      if (!record) {
        throw AppException.from(APP_ERRORS.positions.notFound, undefined);
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

    const where: FindOptionsWhere<PositionsEntity> = {};

    if (typeof input.isActive === "boolean") {
      where.isActive = input.isActive;
    }

    if (input.search?.trim()) {
      where.name = ILike(`%${input.search.trim()}%`);
    }

    const { page, limit, skip } = resolvePagination(input.page, input.limit);

    const [records, total] = await positionsRepo.findAndCount({
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
