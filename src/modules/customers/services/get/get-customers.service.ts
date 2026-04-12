import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CustomersEntity } from '../../entities/customers.entity';
import { GetCustomersInputDto } from '../../dtos/get/get-customers-input.dto';
import { GetCustomersResponseDto } from '../../dtos/get/get-customers-response.dto';
import { GetCustomersValidator } from '../../validators/get/get-customers.validator';

@Injectable()
export class GetCustomersService {
  constructor(
    @InjectRepository(CustomersEntity)
    private readonly customersRepository: Repository<CustomersEntity>,
  ) { }

  async findAll(
    userId: string,
    input?: GetCustomersInputDto,
  ): Promise<GetCustomersResponseDto[]> {
    const cacheKey = `customers:list:user:${userId}`;


    const records = await GetCustomersValidator.validateAndFetchRecords(
      userId,
      input ?? {},
      this.customersRepository,
    );

    const formatted = records.map((r) => ({
      idCustomers: r.idCustomers,
      name: r.name,
      document: r.document,
      type: r.type as 'individual' | 'company',
      email: r.email,
      phone: r.phone,
      birthDate: r.birthDate,
      address: r.address,
      isActive: r.isActive,
      createdAt: new Date(r.createdAt).toISOString(),
      updatedAt: new Date(r.updatedAt).toISOString(),
    }));



    return formatted;
  }
}