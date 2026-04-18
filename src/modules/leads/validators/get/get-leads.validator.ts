import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import {
  calculateHasNextPage,
  calculateTotalPages,
  resolvePagination,
} from "../../../../common/responses/helpers/pagination.helper";
import { LeadsEntity } from "../../entities/leads.entity";
import { GetLeadsInputDto } from "../../dtos/get/get-leads-input.dto";

export class GetLeadsValidator {
  static async validateAndFetchRecords(
    userId: string,
    input: GetLeadsInputDto,
    repo: Repository<LeadsEntity>,
  ): Promise<PaginatedResult<LeadsEntity>> {
    if (input.idLeads) {
      const record = await repo.findOne({
        where: { idLeads: input.idLeads, idUsers: userId },
      });

      if (!record) {
        throw AppException.from(APP_ERRORS.leads.notFound, undefined);
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
      .createQueryBuilder("lead")
      .where("lead.idUsers = :userId", { userId });

    if (input.status) {
      queryBuilder.andWhere("lead.status = :status", { status: input.status });
    }

    if (input.startDate) {
      queryBuilder.andWhere("lead.createdAt >= :startDate", {
        startDate: new Date(input.startDate),
      });
    }

    if (input.endDate) {
      queryBuilder.andWhere("lead.createdAt <= :endDate", {
        endDate: new Date(input.endDate),
      });
    }

    const [records, total] = await queryBuilder
      .orderBy("lead.createdAt", "DESC")
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
