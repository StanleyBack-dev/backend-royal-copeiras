import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { CustomersEntity } from "../../entities/customers.entity";
import { ProfileEntity } from "../../../profiles/entities/profile.entity";
import { CustomersBaseValidator } from "../base/base-customers.validator";
import { CreateCustomersInputDto } from "../../dtos/create/create-customers-input.dto";
import { calculateBMI } from "../../../../common/utils/bmi.util";

export class CreateCustomersValidator extends CustomersBaseValidator {

  static async validateAndCreate(
    userId: string,
    input: CreateCustomersInputDto,
    customersRepo: Repository<CustomersEntity>,
    profileRepo: Repository<ProfileEntity>
  ): Promise<CustomersEntity> {

    this.ensureRequiredFields(input);
    this.validateDate(input.measurementDate);
    this.validateRanges(input.weightKg);

    const profile = await profileRepo.findOne({ where: { idUsers: userId } });
    if (!profile) {
      throw new NotFoundException('Perfil do usuário não encontrado.');
    }

    if (!profile.heightM || profile.heightM <= 0) {
      throw new BadRequestException('Altura inválida ou não cadastrada no perfil do usuário.');
    }

    await this.ensureUniqueMeasurementDate(userId, input.measurementDate, customersRepo);

    const { bmi, status } = calculateBMI(profile.heightM, input.weightKg);

    const newRecord = customersRepo.create({
      idUsers: userId,
      weightKg: input.weightKg,
      bmi,
      bmiStatus: status,
      observation: input.observation,
      measurementDate: input.measurementDate,
    });

    return customersRepo.save(newRecord);
  }

  private static ensureRequiredFields(input: CreateCustomersInputDto): void {
    if (!input.weightKg) {
      throw new BadRequestException('Peso é obrigatório.');
    }
    if (!input.measurementDate) {
      throw new BadRequestException('A data da medição é obrigatória.');
    }
  }

  private static async ensureUniqueMeasurementDate(
    userId: string,
    dateString: string,
    repo: Repository<CustomersEntity>,
  ): Promise<void> {
    const existing = await repo.findOne({ where: { idUsers: userId, measurementDate: dateString } });
    if (existing) {
      throw new BadRequestException('Já existe um registro de saúde para esta data.');
    }
  }
}