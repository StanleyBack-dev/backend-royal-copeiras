import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { UpdatePositionsInputDto } from "../../dtos/update/update-positions-input.dto";
import { PositionsEntity } from "../../entities/positions.entity";
import { PositionsBaseValidator } from "../base/base-positions.validator";

export class UpdatePositionsValidator extends PositionsBaseValidator {
  static async validateAndUpdate(
    input: UpdatePositionsInputDto,
    positionsRepo: Repository<PositionsEntity>,
  ): Promise<PositionsEntity> {
    if (!input.idPositions) {
      throw AppException.from(APP_ERRORS.positions.idRequired, undefined);
    }

    const record = await positionsRepo.findOne({
      where: { idPositions: input.idPositions },
    });

    if (!record) {
      throw AppException.from(APP_ERRORS.positions.notFound, undefined);
    }

    if (input.name !== undefined) {
      const normalizedName = this.normalizeName(input.name);

      if (normalizedName !== record.normalizedName) {
        const existing = await positionsRepo.findOne({
          where: { normalizedName },
        });

        if (existing) {
          throw AppException.from(
            APP_ERRORS.positions.duplicateName,
            undefined,
          );
        }
      }

      record.name = input.name.trim();
      record.normalizedName = normalizedName;
    }

    if (input.isActive !== undefined) {
      record.isActive = input.isActive;
    }

    return positionsRepo.save(record);
  }
}
