import {} from "@nestjs/common";
import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { ProfileEntity } from "../../entities/profile.entity";
import { UpdateProfileInputDto } from "../../dtos/update/update-profile-input.dto";

export class UpdateProfileValidator {
  private static ensureHasFields(input?: UpdateProfileInputDto): void {
    if (!input) {
      throw AppException.from(APP_ERRORS.profiles.noUpdateData, undefined);
    }

    const hasField = Object.values(input).some(
      (value) => value !== undefined && value !== null,
    );
    if (!hasField) {
      throw AppException.from(
        APP_ERRORS.profiles.atLeastOneFieldRequired,
        undefined,
      );
    }
  }

  private static validateEnums(input: UpdateProfileInputDto): void {
    const sexOptions = ["male", "female", "other"];
    const activityOptions = [
      "sedentary",
      "light",
      "moderate",
      "active",
      "very_active",
    ];
    const goalOptions = ["lose_weight", "maintain", "gain_weight"];

    if (input.sex && !sexOptions.includes(input.sex)) {
      throw AppException.from(APP_ERRORS.profiles.invalidOption, {
        field: "sex",
        options: sexOptions,
      });
    }

    if (input.activityLevel && !activityOptions.includes(input.activityLevel)) {
      throw AppException.from(APP_ERRORS.profiles.invalidOption, {
        field: "activityLevel",
        options: activityOptions,
      });
    }

    if (input.goal && !goalOptions.includes(input.goal)) {
      throw AppException.from(APP_ERRORS.profiles.invalidOption, {
        field: "goal",
        options: goalOptions,
      });
    }
  }

  private static async ensureProfileExists(
    userId: string,
    profileRepo: Repository<ProfileEntity>,
  ): Promise<ProfileEntity> {
    const profile = await profileRepo.findOne({
      where: { user: { idUsers: userId } },
      relations: ["user"],
    });

    if (!profile) {
      throw AppException.from(APP_ERRORS.profiles.notFoundForUser, undefined);
    }

    if (profile.user.idUsers !== userId) {
      throw AppException.from(APP_ERRORS.profiles.editForbidden, undefined);
    }

    return profile;
  }

  static async validateAndUpdate(
    userId: string,
    input: UpdateProfileInputDto,
    repo: Repository<ProfileEntity>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ProfileEntity> {
    this.ensureHasFields(input);
    this.validateEnums(input);

    const profile = await this.ensureProfileExists(userId, repo);

    if (input.phone !== undefined) profile.phone = input.phone;
    if (input.birthDate !== undefined) profile.birthDate = input.birthDate;
    if (input.sex !== undefined) profile.sex = input.sex;
    if (input.activityLevel !== undefined)
      profile.activityLevel = input.activityLevel;
    if (input.goal !== undefined) profile.goal = input.goal;

    if (ipAddress) profile.ipAddress = ipAddress;
    if (userAgent) profile.userAgent = userAgent;

    return repo.save(profile);
  }
}
