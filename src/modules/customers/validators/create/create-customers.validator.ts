import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { CustomersEntity } from "../../entities/customers.entity";
import { CustomersBaseValidator } from "../base/base-customers.validator";
import { CreateCustomersInputDto } from "../../dtos/create/create-customers-input.dto";

export class CreateCustomersValidator extends CustomersBaseValidator {
  static async validateAndCreate(
    userId: string,
    input: CreateCustomersInputDto,
    customersRepo: Repository<CustomersEntity>,
  ): Promise<CustomersEntity> {
    const existing = await customersRepo.findOne({
      where: { document: input.document },
    });
    if (existing) {
      throw AppException.from(
        APP_ERRORS.customers.duplicateDocument,
        undefined,
      );
    }

    const newRecord = customersRepo.create({
      idUsers: userId,
      name: input.name,
      document: input.document,
      type: input.type,
      email: input.email,
      phone: input.phone,
      address: input.address,
      isActive: input.isActive,
    });

    return customersRepo.save(newRecord);
  }
}
