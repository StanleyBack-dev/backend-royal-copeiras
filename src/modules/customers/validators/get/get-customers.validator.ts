import { NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
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
      if (!record) throw new NotFoundException("Cliente não encontrado.");
      return [record];
    }

    const records = await repo.find({
      where: { idUsers: userId },
      order: { createdAt: "DESC" },
    });

    if (!records.length) {
      throw new NotFoundException("Nenhum cliente encontrado.");
    }

    return records;
  }
}
