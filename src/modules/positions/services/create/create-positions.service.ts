import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { IPosition } from "../../interface/position.interface";
import { CreatePositionsInputDto } from "../../dtos/create/create-positions-input.dto";
import { CreatePositionsResponseDto } from "../../dtos/create/create-positions-response.dto";
import { PositionsEntity } from "../../entities/positions.entity";
import { CreatePositionsValidator } from "../../validators/create/create-positions.validator";

@Injectable()
export class CreatePositionsService {
  constructor(
    @InjectRepository(PositionsEntity)
    private readonly positionsRepository: Repository<PositionsEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    userId: string,
    input: CreatePositionsInputDto,
  ): Promise<IPosition> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_EMPLOYEES,
    );

    const created = await CreatePositionsValidator.validateAndCreate(
      userId,
      input,
      this.positionsRepository,
    );

    return CreatePositionsResponseDto.fromEntity(created);
  }
}
