import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CustomersEntity } from "../../entities/customers.entity";
import { GetCustomersInputDto } from "../../dtos/get/get-customers-input.dto";
import { GetCustomersResponseDto } from "../../dtos/get/get-customers-response.dto";
import { GetCustomersValidator } from "../../validators/get/get-customers.validator";
import { CacheGetProvider } from "../../../../common/cache/providers/cache-get.provider";
import { CacheSetProvider } from "../../../../common/cache/providers/cache-set.provider";

@Injectable()
export class GetCustomersService {
  constructor(
    @InjectRepository(CustomersEntity)
    private readonly customersRepository: Repository<CustomersEntity>,
    private readonly cacheGet: CacheGetProvider,
    private readonly cacheSet: CacheSetProvider,
  ) { }

  async findAll(
    userId: string,
    input?: GetCustomersInputDto,
  ): Promise<GetCustomersResponseDto[]> {
    const cacheKey = `customers:list:user:${userId}`;

    const cached = await this.cacheGet.execute<GetCustomersResponseDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const records = await GetCustomersValidator.validateAndFetchRecords(
      userId,
      input ?? {},
      this.customersRepository,
    );

    const formatted = records.map((r) => ({
      idCustomers: r.idCustomers,
      weightKg: r.weightKg,
      bmi: r.bmi,
      bmiStatus: r.bmiStatus,
      observation: r.observation,
      measurementDate: new Date(r.measurementDate).toISOString().slice(0, 10),
      createdAt: new Date(r.createdAt).toISOString(),
      updatedAt: new Date(r.updatedAt).toISOString(),
    }));

    // 12 HOURS
    await this.cacheSet.execute(cacheKey, formatted, 43200);

    return formatted;
  }
}