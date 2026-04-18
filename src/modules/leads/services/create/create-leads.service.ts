import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LeadsEntity } from "../../entities/leads.entity";
import { CreateLeadsInputDto } from "../../dtos/create/create-leads-input.dto";
import { CreateLeadsResponseDto } from "../../dtos/create/create-leads-response.dto";
import { ILead } from "../../interface/lead.interface";
import { CreateLeadsValidator } from "../../validators/create/create-leads.validator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";

@Injectable()
export class CreateLeadsService {
  constructor(
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(userId: string, input: CreateLeadsInputDto): Promise<ILead> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_LEADS,
    );

    const saved = await CreateLeadsValidator.validateAndCreate(
      userId,
      input,
      this.leadsRepository,
    );

    return CreateLeadsResponseDto.fromEntity(saved);
  }
}
