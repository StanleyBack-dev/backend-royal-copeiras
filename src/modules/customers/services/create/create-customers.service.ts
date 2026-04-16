import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CustomersEntity } from "../../entities/customers.entity";
import { CreateCustomersInputDto } from "../../dtos/create/create-customers-input.dto";
import { CreateCustomersResponseDto } from "../../dtos/create/create-customers-response.dto";
import { ICustomer } from "../../interface/customer.interface";
import { CreateCustomersValidator } from "../../validators/create/create-customers.validator";
import { ProfileEntity } from "../../../profiles/entities/profile.entity";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";

@Injectable()
export class CreateCustomersService {
  constructor(
    @InjectRepository(CustomersEntity)
    private readonly customersRepository: Repository<CustomersEntity>,

    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    userId: string,
    input: CreateCustomersInputDto,
  ): Promise<ICustomer> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_CUSTOMERS,
    );

    const saved = await CreateCustomersValidator.validateAndCreate(
      userId,
      input,
      this.customersRepository,
    );

    return CreateCustomersResponseDto.fromEntity(saved);
  }
}
