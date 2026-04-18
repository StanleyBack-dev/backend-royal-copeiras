import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import {
  calculateHasNextPage,
  calculateTotalPages,
  resolvePagination,
} from "../../../../common/responses/helpers/pagination.helper";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { GetBudgetsInputDto } from "../../dtos/get/get-budgets-input.dto";

export class GetBudgetsValidator {
  static async validateAndFetchRecords(
    userId: string,
    input: GetBudgetsInputDto,
    repo: Repository<BudgetsEntity>,
  ): Promise<PaginatedResult<BudgetsEntity>> {
    if (input.idBudgets) {
      const record = await repo.findOne({
        where: { idBudgets: input.idBudgets, idUsers: userId },
        relations: { items: true },
      });

      if (!record) {
        throw AppException.from(APP_ERRORS.budgets.notFound, undefined);
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

    const queryBuilder = repo
      .createQueryBuilder("budget")
      .leftJoinAndSelect("budget.items", "item")
      .where("budget.idUsers = :userId", { userId });

    if (input.idLeads) {
      queryBuilder.andWhere("budget.idLeads = :idLeads", {
        idLeads: input.idLeads,
      });
    }

    if (input.status) {
      queryBuilder.andWhere("budget.status = :status", {
        status: input.status,
      });
    }

    if (input.startDate) {
      queryBuilder.andWhere("budget.issueDate >= :startDate", {
        startDate: input.startDate,
      });
    }

    if (input.endDate) {
      queryBuilder.andWhere("budget.issueDate <= :endDate", {
        endDate: input.endDate,
      });
    }

    const [records, total] = await queryBuilder
      .orderBy("budget.createdAt", "DESC")
      .addOrderBy("item.sortOrder", "ASC")
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
