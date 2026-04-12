import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileEntity } from '../../entities/profile.entity';
import { UpdateProfileInputDto } from '../../dtos/update/update-profile-input.dto';
import { UpdateProfileResponseDto } from '../../dtos/update/update-profile-response.dto';
import { UpdateProfileValidator } from '../../validators/update/update-profile.validator';
import { CacheDelProvider } from '../../../../common/cache/providers/cache-del.provider';

@Injectable()
export class UpdateProfileService {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private readonly cacheDel: CacheDelProvider,
  ) { }

  async execute(
    userId: string,
    input: UpdateProfileInputDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<UpdateProfileResponseDto> {
    const updated = await UpdateProfileValidator.validateAndUpdate(
      userId,
      input,
      this.profileRepository,
      ipAddress,
      userAgent,
    );

    await this.cacheDel.execute(`profile:user:${userId}`);
    await this.cacheDel.execute(`profile:findOne:${updated.idProfiles}`);

    return {
      idProfiles: updated.idProfiles,
      phone: updated.phone,
      birthDate: updated.birthDate,
      sex: updated.sex,
      heightM: updated.heightM,
      activityLevel: updated.activityLevel,
      goal: updated.goal,
    };
  }
}