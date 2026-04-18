import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LeadsEntity } from "../../entities/leads.entity";
import { UpdateLeadsInputDto } from "../../dtos/update/update-leads-input.dto";
import { UpdateLeadsResponseDto } from "../../dtos/update/update-leads-response.dto";
import { ILead } from "../../interface/lead.interface";
import { UpdateLeadsValidator } from "../../validators/update/update-leads.validator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";

@Injectable()
export class UpdateLeadsService {
  constructor(
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(userId: string, input: UpdateLeadsInputDto): Promise<ILead> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_LEADS,
    );

    const updated = await UpdateLeadsValidator.validateAndUpdate(
      userId,
      input,
      this.leadsRepository,
    );

    return UpdateLeadsResponseDto.fromEntity(updated);
  }
}
