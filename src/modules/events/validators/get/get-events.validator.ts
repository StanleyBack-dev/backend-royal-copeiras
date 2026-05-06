import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import {
  calculateHasNextPage,
  calculateTotalPages,
  resolvePagination,
} from "../../../../common/responses/helpers/pagination.helper";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import { EventEntity } from "../../entities/event.entity";
import { GetEventsInputDto } from "../../dtos/get/get-events-input.dto";

export class GetEventsValidator {
  static async validateAndFetchRecords(
    input: GetEventsInputDto,
    repository: Repository<EventEntity>,
  ): Promise<PaginatedResult<EventEntity>> {
    if (input.idEvents) {
      const record = await repository.findOne({
        where: { idEvents: input.idEvents },
        relations: {
          contract: true,
          budget: { items: true },
          lead: true,
          customer: true,
          assignments: { budgetItem: true, employee: true },
        },
      });

      if (!record) {
        throw AppException.from(APP_ERRORS.events.notFound, undefined);
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

    const where: FindOptionsWhere<EventEntity> = {};

    if (input.idContracts) {
      where.idContracts = input.idContracts;
    }

    if (input.status) {
      where.status = input.status;
    }

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

    const [records, total] = await repository.findAndCount({
      where,
      relations: {
        contract: true,
        budget: { items: true },
        lead: true,
        customer: true,
        assignments: { budgetItem: true, employee: true },
      },
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
