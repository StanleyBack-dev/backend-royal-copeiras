import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { ISupply } from "../../interface/supply.interface";
import { UpdateSuppliesInputDto } from "../../dtos/update/update-supplies-input.dto";
import { UpdateSuppliesResponseDto } from "../../dtos/update/update-supplies-response.dto";
import { SuppliesEntity } from "../../entities/supplies.entity";
import { UpdateSuppliesValidator } from "../../validators/update/update-supplies.validator";

@Injectable()
export class UpdateSuppliesService {
  constructor(
    @InjectRepository(SuppliesEntity)
    private readonly suppliesRepository: Repository<SuppliesEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    userId: string,
    input: UpdateSuppliesInputDto,
  ): Promise<ISupply> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const updated = await UpdateSuppliesValidator.validateAndUpdate(
      input,
      this.suppliesRepository,
    );

    return UpdateSuppliesResponseDto.fromEntity(updated);
  }
}
