import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { CompanyProfileEntity } from "../../entities/company-profile.entity";
import { UpdateCompanyProfileInputDto } from "../../dtos/update/update-company-profile-input.dto";
import { UpdateCompanyProfileResponseDto } from "../../dtos/update/update-company-profile-response.dto";
import { UpdateCompanyProfileValidator } from "../../validators/update/update-company-profile.validator";
import { GetCompanyProfileService } from "../get/get-company-profile.service";

@Injectable()
export class UpdateCompanyProfileService {
  constructor(
    @InjectRepository(CompanyProfileEntity)
    private readonly companyProfileRepository: Repository<CompanyProfileEntity>,
    private readonly authorizationService: AuthorizationService,
    private readonly getCompanyProfileService: GetCompanyProfileService,
  ) {}

  async execute(
    userId: string,
    input: UpdateCompanyProfileInputDto,
  ): Promise<UpdateCompanyProfileResponseDto> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_COMPANY_PROFILE,
    );

    const record = await this.getCompanyProfileService.resolveEntity();

    const updated = await UpdateCompanyProfileValidator.validateAndUpdate(
      input,
      record,
      this.companyProfileRepository,
    );

    return UpdateCompanyProfileResponseDto.fromEntity(updated);
  }
}
