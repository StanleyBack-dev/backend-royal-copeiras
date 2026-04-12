import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileEntity } from '../../entities/profile.entity';
import { GetProfileInputDto } from '../../dtos/get/get-profile-input.dto';
import { GetProfileResponseDto } from '../../dtos/get/get-profile-response.dto';
import { GetProfileValidator } from '../../validators/get/get-profile.validator';

@Injectable()
export class GetProfileService {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
  ) { }

  async findByUser(userId: string): Promise<GetProfileResponseDto> {
    // const cacheKey = `profile:user:${userId}`;

    const profile = await GetProfileValidator.ensureProfileExistsByUser(
      userId,
      this.profileRepository,
    );
    return this.mapToResponse(profile);
  }

  async findOne(input: GetProfileInputDto): Promise<GetProfileResponseDto> {
    // const cacheKey = `profile:findOne:${input.idProfiles}`;

    const profile = await GetProfileValidator.ensureProfileExists(
      input,
      this.profileRepository,
    );
    return this.mapToResponse(profile);
  }

  private mapToResponse(profile: ProfileEntity): GetProfileResponseDto {
    return {
      idProfiles: profile.idProfiles,
      phone: profile.phone,
      birthDate: profile.birthDate,
      sex: profile.sex,
      heightM: profile.heightM,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
    };
  }
}