import { BadRequestException } from "@nestjs/common";
import { Repository } from "typeorm";
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
      throw new BadRequestException("Já existe um cliente com este documento.");
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
