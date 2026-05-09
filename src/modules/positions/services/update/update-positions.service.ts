import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { IPosition } from "../../interface/position.interface";
import { UpdatePositionsInputDto } from "../../dtos/update/update-positions-input.dto";
import { UpdatePositionsResponseDto } from "../../dtos/update/update-positions-response.dto";
import { PositionsEntity } from "../../entities/positions.entity";
import { UpdatePositionsValidator } from "../../validators/update/update-positions.validator";

@Injectable()
export class UpdatePositionsService {
  constructor(
    @InjectRepository(PositionsEntity)
    private readonly positionsRepository: Repository<PositionsEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    userId: string,
    input: UpdatePositionsInputDto,
  ): Promise<IPosition> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_EMPLOYEES,
    );

    const updated = await UpdatePositionsValidator.validateAndUpdate(
      input,
      this.positionsRepository,
    );

    return UpdatePositionsResponseDto.fromEntity(updated);
  }
}
