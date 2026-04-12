import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileEntity } from '../../entities/profile.entity';
import { CreateProfileInputDto } from '../../dtos/create/create-profile-input.dto';
import { CreateProfileValidator } from '../../validators/create/create-profile.validator';
import { CacheDelProvider } from '../../../../common/cache/providers/cache-del.provider';

@Injectable()
export class CreateProfileService {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private readonly createProfileValidator: CreateProfileValidator,
    private readonly cacheDel: CacheDelProvider,
  ) { }

  async execute(
    idUsers: string,
    input: CreateProfileInputDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ProfileEntity> {
    const profile = await this.createProfileValidator.validateAndCreate(
      idUsers,
      input,
      this.profileRepository,
      ipAddress,
      userAgent,
    );

    await this.cacheDel.execute(`profile:user:${idUsers}`);

    return profile;
  }
}