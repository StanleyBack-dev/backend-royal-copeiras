import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProfileEntity } from "../../entities/profile.entity";
import { UpdateProfileInputDto } from "../../dtos/update/update-profile-input.dto";
import { UpdateProfileResponseDto } from "../../dtos/update/update-profile-response.dto";
import { UpdateProfileValidator } from "../../validators/update/update-profile.validator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";

@Injectable()
export class UpdateProfileService {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    userId: string,
    input: UpdateProfileInputDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<UpdateProfileResponseDto> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_OWN_PROFILE,
    );

    const updated = await UpdateProfileValidator.validateAndUpdate(
      userId,
      input,
      this.profileRepository,
      ipAddress,
      userAgent,
    );

    return {
      idProfiles: updated.idProfiles,
      phone: updated.phone,
      birthDate: updated.birthDate,
      sex: updated.sex,
      activityLevel: updated.activityLevel,
      goal: updated.goal,
    };
  }
}
