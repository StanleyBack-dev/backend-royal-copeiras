import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileEntity } from '../../entities/profile.entity';
import { GetProfileInputDto } from '../../dtos/get/get-profile-input.dto';
import { GetProfileResponseDto } from '../../dtos/get/get-profile-response.dto';
import { GetProfileValidator } from '../../validators/get/get-profile.validator';
import { CacheGetProvider } from '../../../../common/cache/providers/cache-get.provider';
import { CacheSetProvider } from '../../../../common/cache/providers/cache-set.provider';

@Injectable()
export class GetProfileService {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private readonly cacheGet: CacheGetProvider,
    private readonly cacheSet: CacheSetProvider,
  ) { }

  async findByUser(userId: string): Promise<GetProfileResponseDto> {
    const cacheKey = `profile:user:${userId}`;

    const cached = await this.cacheGet.execute<GetProfileResponseDto>(cacheKey);
    if (cached) return cached;

    const profile = await GetProfileValidator.ensureProfileExistsByUser(
      userId,
      this.profileRepository,
    );

    const formatted = this.mapToResponse(profile);

    await this.cacheSet.execute(cacheKey, formatted, 43200);

    return formatted;
  }

  async findOne(input: GetProfileInputDto): Promise<GetProfileResponseDto> {
    const cacheKey = `profile:findOne:${input.idProfiles}`;

    const cached = await this.cacheGet.execute<GetProfileResponseDto>(cacheKey);
    if (cached) return cached;

    const profile = await GetProfileValidator.ensureProfileExists(
      input,
      this.profileRepository,
    );

    const formatted = this.mapToResponse(profile);
    await this.cacheSet.execute(cacheKey, formatted, 43200);

    return formatted;
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