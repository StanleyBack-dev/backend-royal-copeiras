import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import {
  calculateHasNextPage,
  calculateTotalPages,
  resolvePagination,
} from "../../../../common/responses/helpers/pagination.helper";
import { ContractsEntity } from "../../entities/contracts.entity";
import { GetContractsInputDto } from "../../dtos/get/get-contracts-input.dto";

export class GetContractsValidator {
  static async validateAndFetchRecords(
    userId: string,
    input: GetContractsInputDto,
    repo: Repository<ContractsEntity>,
  ): Promise<PaginatedResult<ContractsEntity>> {
    if (input.idContracts) {
      const record = await repo.findOne({
        where: { idContracts: input.idContracts },
      });

      if (!record) {
        throw AppException.from(APP_ERRORS.contracts.notFound, undefined);
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

    const queryBuilder = repo.createQueryBuilder("contract");

    if (input.idBudgets) {
      queryBuilder.andWhere("contract.idBudgets = :idBudgets", {
        idBudgets: input.idBudgets,
      });
    }

    if (input.status) {
      queryBuilder.andWhere("contract.status = :status", {
        status: input.status,
      });
    }

    if (input.startDate) {
      queryBuilder.andWhere("contract.createdAt >= :startDate", {
        startDate: new Date(input.startDate),
      });
    }

    if (input.endDate) {
      queryBuilder.andWhere("contract.createdAt <= :endDate", {
        endDate: new Date(input.endDate),
      });
    }

    const [records, total] = await queryBuilder
      .orderBy("contract.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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
