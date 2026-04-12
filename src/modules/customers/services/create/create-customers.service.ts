import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomersEntity } from '../../entities/customers.entity';
import { CreateCustomersInputDto } from '../../dtos/create/create-customers-input.dto';
import { CreateCustomersResponseDto } from '../../dtos/create/create-customers-response.dto';
import { CreateCustomersValidator } from '../../validators/create/create-customers.validator';
import { CacheDelProvider } from '../../../../common/cache/providers/cache-del.provider';
import { ProfileEntity } from '../../../profiles/entities/profile.entity';

@Injectable()
export class CreateCustomersService {
  constructor(
    @InjectRepository(CustomersEntity)
    private readonly customersRepository: Repository<CustomersEntity>,

    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,

    private readonly cacheDel: CacheDelProvider,
  ) { }

  async execute(userId: string, input: CreateCustomersInputDto): Promise<CreateCustomersResponseDto> {
    const saved = await CreateCustomersValidator.validateAndCreate(
      userId,
      input,
      this.customersRepository,
      this.profileRepository,
    );

    await this.cacheDel.execute(`customers:list:user:${userId}`);

    return {
      idCustomers: saved.idCustomers,
      weightKg: saved.weightKg,
      bmi: saved.bmi,
      bmiStatus: saved.bmiStatus,
      observation: saved.observation,
      measurementDate: saved.measurementDate,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}