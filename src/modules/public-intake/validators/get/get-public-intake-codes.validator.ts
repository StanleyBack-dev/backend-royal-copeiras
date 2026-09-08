import { Repository } from "typeorm";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import {
  calculateHasNextPage,
  calculateTotalPages,
  resolvePagination,
} from "../../../../common/responses/helpers/pagination.helper";
import { PublicIntakeCodeEntity } from "../../entities/public-intake-code.entity";
import { GetPublicIntakeCodesInputDto } from "../../dtos/get/get-public-intake-codes-input.dto";

export class GetPublicIntakeCodesValidator {
  static async validateAndFetchRecords(
    input: GetPublicIntakeCodesInputDto,
    repo: Repository<PublicIntakeCodeEntity>,
  ): Promise<PaginatedResult<PublicIntakeCodeEntity>> {
    const { page, limit, skip } = resolvePagination(input.page, input.limit);

    const [records, total] = await repo
      .createQueryBuilder("intake_code")
      .orderBy("intake_code.created_at", "DESC")
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
