import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomersEntity } from '../../entities/customers.entity';
import { CreateCustomersInputDto } from '../../dtos/create/create-customers-input.dto';
import { CreateCustomersResponseDto } from '../../dtos/create/create-customers-response.dto';
import { CreateCustomersValidator } from '../../validators/create/create-customers.validator';
import { ProfileEntity } from '../../../profiles/entities/profile.entity';

@Injectable()
export class CreateCustomersService {
  constructor(
    @InjectRepository(CustomersEntity)
    private readonly customersRepository: Repository<CustomersEntity>,

    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,

  ) { }

  async execute(userId: string, input: CreateCustomersInputDto): Promise<CreateCustomersResponseDto> {
    const saved = await CreateCustomersValidator.validateAndCreate(
      userId,
      input,
      this.customersRepository,
    );

    return {
      idCustomers: saved.idCustomers,
      name: saved.name,
      document: saved.document,
      type: saved.type as 'individual' | 'company',
      email: saved.email,
      phone: saved.phone,
      birthDate: saved.birthDate,
      address: saved.address,
      isActive: saved.isActive,
      createdAt: new Date(saved.createdAt).toISOString(),
      updatedAt: new Date(saved.updatedAt).toISOString(),
    };
  }
}