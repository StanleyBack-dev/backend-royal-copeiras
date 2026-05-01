import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginatedResult } from "../../../common/responses/interfaces/response.interface";
import {
  calculateHasNextPage,
  calculateTotalPages,
  resolvePagination,
} from "../../../common/responses/helpers/pagination.helper";
import { AuthPermission } from "../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../auth/services/authorization.service";
import { SignatureEntity } from "../entities/signature.entity";
import { GetSignaturesInputDto } from "../dtos/get-signatures-input.dto";
import { GetSignaturesResponseDto } from "../dtos/get-signatures-response.dto";

@Injectable()
export class GetSignaturesService {
  constructor(
    @InjectRepository(SignatureEntity)
    private readonly signaturesRepository: Repository<SignatureEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async findAll(
    userId: string,
    input?: GetSignaturesInputDto,
  ): Promise<PaginatedResult<GetSignaturesResponseDto>> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.READ_BUDGETS,
    );

    const { page, limit, skip } = resolvePagination(input?.page, input?.limit);

    const query = this.signaturesRepository
      .createQueryBuilder("signature")
      .leftJoinAndSelect("signature.contract", "contract")
      .orderBy("signature.updatedAt", "DESC")
      .skip(skip)
      .take(limit);

    if (input?.idContracts) {
      query.andWhere("signature.idContracts = :idContracts", {
        idContracts: input.idContracts,
      });
    }

    if (input?.status) {
      query.andWhere("signature.status = :status", { status: input.status });
    }

    const [items, total] = await query.getManyAndCount();
    const totalPages = calculateTotalPages(limit, total);

    return {
      items: items.map(GetSignaturesResponseDto.fromEntity),
      total,
      currentPage: page,
      limit,
      totalPages,
      hasNextPage: calculateHasNextPage(page, limit, total),
    };
  }
}
