import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LeadsEntity } from "../../entities/leads.entity";
import { GetLeadsInputDto } from "../../dtos/get/get-leads-input.dto";
import { GetLeadsResponseDto } from "../../dtos/get/get-leads-response.dto";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import { GetLeadsValidator } from "../../validators/get/get-leads.validator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";

@Injectable()
export class GetLeadsService {
  constructor(
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async findAll(
    userId: string,
    input?: GetLeadsInputDto,
  ): Promise<PaginatedResult<GetLeadsResponseDto>> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.READ_LEADS,
    );

    const records = await GetLeadsValidator.validateAndFetchRecords(
      userId,
      input ?? {},
      this.leadsRepository,
    );

    return {
      ...records,
      items: records.items.map((record) =>
        GetLeadsResponseDto.fromEntity(record),
      ),
    };
  }
}
