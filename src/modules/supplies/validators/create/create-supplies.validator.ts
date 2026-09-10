import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { CreateSuppliesInputDto } from "../../dtos/create/create-supplies-input.dto";
import { SuppliesEntity } from "../../entities/supplies.entity";
import { SuppliesBaseValidator } from "../base/base-supplies.validator";

export class CreateSuppliesValidator extends SuppliesBaseValidator {
  static async validateAndCreate(
    userId: string,
    input: CreateSuppliesInputDto,
    suppliesRepo: Repository<SuppliesEntity>,
  ): Promise<SuppliesEntity> {
    const normalizedName = this.normalizeName(input.name);

    const existing = await suppliesRepo.findOne({
      where: { normalizedName },
    });

    if (existing) {
      throw AppException.from(APP_ERRORS.supplies.duplicateName, undefined);
    }

    const created = suppliesRepo.create({
      idUsers: userId,
      name: input.name.trim(),
      normalizedName,
      defaultUnit: input.defaultUnit?.trim() || null,
      suggestedUnitPrice:
        input.suggestedUnitPrice === undefined
          ? null
          : Number(input.suggestedUnitPrice.toFixed(2)),
      isActive: input.isActive,
    });

    return suppliesRepo.save(created);
  }
}
