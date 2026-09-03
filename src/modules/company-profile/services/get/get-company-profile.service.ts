import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { CompanyProfileEntity } from "../../entities/company-profile.entity";
import { GetCompanyProfileResponseDto } from "../../dtos/get/get-company-profile-response.dto";
import { COMPANY_PROFILE_DEFAULTS } from "../../constants/company-profile-defaults.constant";

@Injectable()
export class GetCompanyProfileService {
  constructor(
    @InjectRepository(CompanyProfileEntity)
    private readonly companyProfileRepository: Repository<CompanyProfileEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  /**
   * Returns the single company profile record, creating it with the Royal
   * Copeiras default values when it does not exist yet. Does not check
   * permissions: use only from internal flows (e.g. contract generation).
   */
  async resolveEntity(): Promise<CompanyProfileEntity> {
    const [existing] = await this.companyProfileRepository.find({
      order: { createdAt: "ASC" },
      take: 1,
    });

    if (existing) {
      return existing;
    }

    const created = this.companyProfileRepository.create({
      ...COMPANY_PROFILE_DEFAULTS,
    });

    return this.companyProfileRepository.save(created);
  }

  async execute(userId: string): Promise<GetCompanyProfileResponseDto> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.READ_COMPANY_PROFILE,
    );

    const entity = await this.resolveEntity();

    return GetCompanyProfileResponseDto.fromEntity(entity);
  }
}
