import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { CreatePositionsInputDto } from "../../dtos/create/create-positions-input.dto";
import { PositionsEntity } from "../../entities/positions.entity";
import { PositionsBaseValidator } from "../base/base-positions.validator";

export class CreatePositionsValidator extends PositionsBaseValidator {
  static async validateAndCreate(
    userId: string,
    input: CreatePositionsInputDto,
    positionsRepo: Repository<PositionsEntity>,
  ): Promise<PositionsEntity> {
    const normalizedName = this.normalizeName(input.name);

    const existing = await positionsRepo.findOne({
      where: { normalizedName },
    });

    if (existing) {
      throw AppException.from(APP_ERRORS.positions.duplicateName, undefined);
    }

    const created = positionsRepo.create({
      idUsers: userId,
      name: input.name.trim(),
      normalizedName,
      isActive: input.isActive,
    });

    return positionsRepo.save(created);
  }
}
