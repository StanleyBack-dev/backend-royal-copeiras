import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { ProfileEntity } from "../../entities/profile.entity";
import { UserEntity } from "../../../users/entities/user.entity";
import { CreateProfileInputDto } from "../../dtos/create/create-profile-input.dto";

@Injectable()
export class CreateProfileValidator {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  static ensureValidInput(
    input: Partial<CreateProfileInputDto> & { idUsers?: string },
  ): void {
    if (!input.idUsers) {
      throw AppException.from(
        APP_ERRORS.profiles.userIdRequiredForCreate,
        undefined,
      );
    }
  }

  async ensureUserExists(idUsers: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { idUsers } });
    if (!user) {
      throw AppException.from(APP_ERRORS.users.notFound, undefined);
    }
    return user;
  }

  async ensureUserHasNoProfile(idUsers: string): Promise<void> {
    const existing = await this.profileRepository.findOne({
      where: { idUsers },
    });
    if (existing) {
      throw AppException.from(
        APP_ERRORS.profiles.alreadyExistsForUser,
        undefined,
      );
    }
  }

  async validateAndCreate(
    idUsers: string,
    input: CreateProfileInputDto,
    repo: Repository<ProfileEntity>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ProfileEntity> {
    CreateProfileValidator.ensureValidInput({ idUsers });

    const user = await this.ensureUserExists(idUsers);
    await this.ensureUserHasNoProfile(idUsers);

    const profile = repo.create({
      user,
      idUsers,
      phone: input.phone,
      birthDate: input.birthDate,
      sex: input.sex,
      activityLevel: input.activityLevel,
      goal: input.goal,
      ipAddress,
      userAgent,
    });

    return repo.save(profile);
  }
}
