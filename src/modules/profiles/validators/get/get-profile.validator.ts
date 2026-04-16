import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { GetProfileInputDto } from "../../dtos/get/get-profile-input.dto";
import { ProfileEntity } from "../../entities/profile.entity";
import { Repository } from "typeorm";

export class GetProfileValidator {
  static ensureValidInput(input?: GetProfileInputDto): void {
    if (!input) {
      throw AppException.from(
        APP_ERRORS.profiles.searchParamsMissing,
        undefined,
      );
    }

    if (!input.idProfiles) {
      throw AppException.from(
        APP_ERRORS.profiles.idProfilesRequired,
        undefined,
      );
    }
  }

  static async ensureProfileExists(
    input: GetProfileInputDto,
    repository: Repository<ProfileEntity>,
  ): Promise<ProfileEntity> {
    this.ensureValidInput(input);

    const profile = await repository.findOne({
      where: { idProfiles: input.idProfiles },
      relations: ["user"],
    });

    if (!profile) {
      throw AppException.from(APP_ERRORS.profiles.notFound, undefined);
    }

    return profile;
  }

  static async ensureProfileExistsByUser(
    userId: string,
    repository: Repository<ProfileEntity>,
  ): Promise<ProfileEntity> {
    const profile = await repository.findOne({
      where: { user: { idUsers: userId } },
      relations: ["user"],
    });

    if (!profile) {
      throw AppException.from(APP_ERRORS.profiles.notFoundForUser, undefined);
    }

    return profile;
  }
}
