import { BadRequestException } from "@nestjs/common";
import { Repository } from "typeorm";
import { EmployeesEntity } from "../../entities/employees.entity";
import { EmployeesBaseValidator } from "../base/base-employees.validator";
import { CreateEmployeesInputDto } from "../../dtos/create/create-employees-input.dto";

export class CreateEmployeesValidator extends EmployeesBaseValidator {
  static async validateAndCreate(
    userId: string,
    input: CreateEmployeesInputDto,
    employeesRepo: Repository<EmployeesEntity>,
  ): Promise<EmployeesEntity> {
    this.validateDocument(input.document);

    const existing = await employeesRepo.findOne({
      where: { document: input.document },
    });

    if (existing) {
      throw new BadRequestException(
        "Ja existe um funcionario com este documento.",
      );
    }

    const newRecord = employeesRepo.create({
      idUsers: userId,
      name: input.name,
      document: input.document,
      email: input.email,
      phone: input.phone,
      position: input.position,
      isActive: input.isActive,
    });

    return employeesRepo.save(newRecord);
  }
}
