import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { EmployeesEntity } from "../../entities/employees.entity";
import { UpdateEmployeesInputDto } from "../../dtos/update/update-employees-input.dto";
import { EmployeesBaseValidator } from "../base/base-employees.validator";

export class UpdateEmployeesValidator extends EmployeesBaseValidator {
  static async validateAndUpdate(
    userId: string,
    input: UpdateEmployeesInputDto,
    employeesRepo: Repository<EmployeesEntity>,
  ): Promise<EmployeesEntity> {
    if (!input.idEmployees) {
      throw new BadRequestException("O campo idEmployees e obrigatorio.");
    }

    const record = await employeesRepo.findOne({
      where: { idEmployees: input.idEmployees, idUsers: userId },
    });

    if (!record) {
      throw new NotFoundException("Funcionario nao encontrado.");
    }

    if (record.idUsers !== userId) {
      throw new ForbiddenException(
        "Voce nao tem permissao para editar este funcionario.",
      );
    }

    if (input.document && input.document !== record.document) {
      const existing = await employeesRepo.findOne({
        where: { document: input.document },
      });

      if (existing) {
        throw new BadRequestException(
          "Ja existe um funcionario com este documento.",
        );
      }

      this.validateDocument(input.document);
    }

    Object.assign(record, input);

    return employeesRepo.save(record);
  }
}
