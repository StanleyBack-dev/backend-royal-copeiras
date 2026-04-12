import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CustomersEntity } from "../../entities/customers.entity";
import { UpdateCustomersInputDto } from "../../dtos/update/update-customers-input.dto";
import { UpdateCustomersResponseDto } from "../../dtos/update/update-customers-response.dto";
import { ICustomer } from "../../interface/customer.interface";
import { UpdateCustomersValidator } from "../../validators/update/update-customers.validator";
import { ProfileEntity } from "../../../profiles/entities/profile.entity";

@Injectable()
export class UpdateCustomersService {
  constructor(
    @InjectRepository(CustomersEntity)
    private readonly customersRepository: Repository<CustomersEntity>,

    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
  ) {}

  async execute(
    userId: string,
    input: UpdateCustomersInputDto,
  ): Promise<ICustomer> {
    const updated = await UpdateCustomersValidator.validateAndUpdate(
      userId,
      input,
      this.customersRepository,
    );

    return UpdateCustomersResponseDto.fromEntity(updated);
  }
}
