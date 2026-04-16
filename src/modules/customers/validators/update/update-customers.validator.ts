import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { CustomersEntity } from "../../entities/customers.entity";
import { UpdateCustomersInputDto } from "../../dtos/update/update-customers-input.dto";
import { CustomersBaseValidator } from "../base/base-customers.validator";

export class UpdateCustomersValidator extends CustomersBaseValidator {
  static async validateAndUpdate(
    userId: string,
    input: UpdateCustomersInputDto,
    customersRepo: Repository<CustomersEntity>,
  ): Promise<CustomersEntity> {
    if (!input.idCustomers) {
      throw AppException.from(APP_ERRORS.customers.idRequired, undefined);
    }

    const record = await customersRepo.findOne({
      where: { idCustomers: input.idCustomers, idUsers: userId },
    });
    if (!record) {
      throw AppException.from(APP_ERRORS.customers.notFound, undefined);
    }

    if (record.idUsers !== userId) {
      throw AppException.from(APP_ERRORS.customers.editForbidden, undefined);
    }

    Object.assign(record, input);

    return customersRepo.save(record);
  }
}
