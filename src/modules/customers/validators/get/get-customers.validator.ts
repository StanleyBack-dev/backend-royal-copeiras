import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { CustomersEntity } from "../../entities/customers.entity";
import { GetCustomersInputDto } from "../../dtos/get/get-customers-input.dto";

export class GetCustomersValidator {
  static async validateAndFetchRecords(
    userId: string,
    input: GetCustomersInputDto,
    repo: Repository<CustomersEntity>,
  ): Promise<CustomersEntity[]> {
    if (input.idCustomers) {
      const record = await repo.findOne({
        where: { idCustomers: input.idCustomers, idUsers: userId },
      });
      if (!record) {
        throw AppException.from(APP_ERRORS.customers.notFound, undefined);
      }
      return [record];
    }

    const records = await repo.find({
      where: { idUsers: userId },
      order: { createdAt: "DESC" },
    });

    if (!records.length) {
      throw AppException.from(APP_ERRORS.customers.noneFound, undefined);
    }

    return records;
  }
}
