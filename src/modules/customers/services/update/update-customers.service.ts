import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomersEntity } from '../../entities/customers.entity';
import { UpdateCustomersInputDto } from '../../dtos/update/update-customers-input.dto';
import { UpdateCustomersResponseDto } from '../../dtos/update/update-customers-response.dto';
import { UpdateCustomersValidator } from '../../validators/update/update-customers.validator';
import { CacheDelProvider } from '../../../../common/cache/providers/cache-del.provider';
import { ProfileEntity } from '../../../profiles/entities/profile.entity';

@Injectable()
export class UpdateCustomersService {
  constructor(
    @InjectRepository(CustomersEntity)
    private readonly customersRepository: Repository<CustomersEntity>,

    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,

    private readonly cacheDel: CacheDelProvider,
  ) { }

  async execute(userId: string, input: UpdateCustomersInputDto): Promise<UpdateCustomersResponseDto> {
    const updated = await UpdateCustomersValidator.validateAndUpdate(
      userId,
      input,
      this.customersRepository,
      this.profileRepository,
    );

    await this.cacheDel.execute(`customers:list:user:${userId}`);

    return {
      idCustomers: updated.idCustomers,
      weightKg: updated.weightKg,
      bmi: updated.bmi,
      bmiStatus: updated.bmiStatus,
      observation: updated.observation,
      measurementDate: updated.measurementDate,
      updatedAt: updated.updatedAt,
    };
  }
}