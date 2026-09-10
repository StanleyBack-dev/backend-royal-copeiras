import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { UpdateSuppliesInputDto } from "../../dtos/update/update-supplies-input.dto";
import { SuppliesEntity } from "../../entities/supplies.entity";
import { SuppliesBaseValidator } from "../base/base-supplies.validator";

export class UpdateSuppliesValidator extends SuppliesBaseValidator {
  static async validateAndUpdate(
    input: UpdateSuppliesInputDto,
    suppliesRepo: Repository<SuppliesEntity>,
  ): Promise<SuppliesEntity> {
    if (!input.idSupplies) {
      throw AppException.from(APP_ERRORS.supplies.idRequired, undefined);
    }

    const record = await suppliesRepo.findOne({
      where: { idSupplies: input.idSupplies },
    });

    if (!record) {
      throw AppException.from(APP_ERRORS.supplies.notFound, undefined);
    }

    if (input.name !== undefined) {
      const normalizedName = this.normalizeName(input.name);

      if (normalizedName !== record.normalizedName) {
        const existing = await suppliesRepo.findOne({
          where: { normalizedName },
        });

        if (existing) {
          throw AppException.from(APP_ERRORS.supplies.duplicateName, undefined);
        }
      }

      record.name = input.name.trim();
      record.normalizedName = normalizedName;
    }

    if (input.defaultUnit !== undefined) {
      record.defaultUnit = input.defaultUnit.trim() || null;
    }

    if (input.suggestedUnitPrice !== undefined) {
      record.suggestedUnitPrice = Number(input.suggestedUnitPrice.toFixed(2));
    }

    if (input.isActive !== undefined) {
      record.isActive = input.isActive;
    }

    return suppliesRepo.save(record);
  }
}
