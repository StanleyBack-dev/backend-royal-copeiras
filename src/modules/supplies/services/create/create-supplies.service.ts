import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { ISupply } from "../../interface/supply.interface";
import { CreateSuppliesInputDto } from "../../dtos/create/create-supplies-input.dto";
import { CreateSuppliesResponseDto } from "../../dtos/create/create-supplies-response.dto";
import { SuppliesEntity } from "../../entities/supplies.entity";
import { CreateSuppliesValidator } from "../../validators/create/create-supplies.validator";

@Injectable()
export class CreateSuppliesService {
  constructor(
    @InjectRepository(SuppliesEntity)
    private readonly suppliesRepository: Repository<SuppliesEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    userId: string,
    input: CreateSuppliesInputDto,
  ): Promise<ISupply> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const created = await CreateSuppliesValidator.validateAndCreate(
      userId,
      input,
      this.suppliesRepository,
    );

    return CreateSuppliesResponseDto.fromEntity(created);
  }
}
