import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CustomersEntity } from "../../entities/customers.entity";
import { GetCustomersInputDto } from "../../dtos/get/get-customers-input.dto";
import { GetCustomersResponseDto } from "../../dtos/get/get-customers-response.dto";
import { ICustomer } from "../../interface/customer.interface";
import { GetCustomersValidator } from "../../validators/get/get-customers.validator";

@Injectable()
export class GetCustomersService {
  constructor(
    @InjectRepository(CustomersEntity)
    private readonly customersRepository: Repository<CustomersEntity>,
  ) {}

  async findAll(
    userId: string,
    input?: GetCustomersInputDto,
  ): Promise<ICustomer[]> {
    // const cacheKey = `customers:list:user:${userId}`;

    const records = await GetCustomersValidator.validateAndFetchRecords(
      userId,
      input ?? {},
      this.customersRepository,
    );

    return records.map((r) => GetCustomersResponseDto.fromEntity(r));
  }
}
