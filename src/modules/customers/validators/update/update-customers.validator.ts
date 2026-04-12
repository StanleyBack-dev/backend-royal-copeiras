import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
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
      throw new BadRequestException("O campo idCustomers é obrigatório.");
    }

    const record = await customersRepo.findOne({
      where: { idCustomers: input.idCustomers, idUsers: userId },
    });
    if (!record) {
      throw new NotFoundException("Cliente não encontrado.");
    }

    if (record.idUsers !== userId) {
      throw new ForbiddenException(
        "Você não tem permissão para editar este cliente.",
      );
    }

    Object.assign(record, input);

    return customersRepo.save(record);
  }
}
