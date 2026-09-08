import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { PublicIntakeCodeEntity } from "../../entities/public-intake-code.entity";
import { GetPublicIntakeCodesInputDto } from "../../dtos/get/get-public-intake-codes-input.dto";
import { GetPublicIntakeCodesResponseDto } from "../../dtos/get/get-public-intake-codes-response.dto";
import { GetPublicIntakeCodesValidator } from "../../validators/get/get-public-intake-codes.validator";

@Injectable()
export class GetPublicIntakeCodesService {
  constructor(
    @InjectRepository(PublicIntakeCodeEntity)
    private readonly codesRepository: Repository<PublicIntakeCodeEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async findAll(
    userId: string,
    input?: GetPublicIntakeCodesInputDto,
  ): Promise<PaginatedResult<GetPublicIntakeCodesResponseDto>> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_LEADS,
    );

    const records = await GetPublicIntakeCodesValidator.validateAndFetchRecords(
      input ?? {},
      this.codesRepository,
    );

    return {
      ...records,
      items: records.items.map((record) =>
        GetPublicIntakeCodesResponseDto.fromEntity(record),
      ),
    };
  }
}
