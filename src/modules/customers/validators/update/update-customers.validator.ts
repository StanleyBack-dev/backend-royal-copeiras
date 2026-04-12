import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomersEntity } from '../../entities/customers.entity';
import { ProfileEntity } from '../../../profiles/entities/profile.entity';
import { UpdateCustomersInputDto } from '../../dtos/update/update-customers-input.dto';
import { CustomersBaseValidator } from '../base/base-customers.validator';
import { calculateBMI } from '../../../../common/utils/bmi.util';

export class UpdateCustomersValidator extends CustomersBaseValidator {

  static async validateAndUpdate(
    userId: string,
    input: UpdateCustomersInputDto,
    customersRepo: Repository<CustomersEntity>,
    profileRepo: Repository<ProfileEntity>,
  ): Promise<CustomersEntity> {
    this.ensureValidInput(input);

    const record = await customersRepo.findOne({ where: { idCustomers: input.idCustomers, idUsers: userId } });
    if (!record) {
      throw new NotFoundException('Registro de saúde não encontrado.');
    }

    if (record.idUsers !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar este registro.');
    }

    const profile = await profileRepo.findOne({ where: { idUsers: userId } });
    if (!profile) {
      throw new NotFoundException('Perfil do usuário não encontrado.');
    }

    if (!profile.heightM || profile.heightM <= 0) {
      throw new BadRequestException('Altura inválida ou não cadastrada no perfil do usuário.');
    }

    Object.assign(record, input);

    if (input.weightKg !== undefined) {
      this.validateRanges(input.weightKg);

      const weight = input.weightKg ?? record.weightKg;
      const { bmi, status } = calculateBMI(profile.heightM, weight);

      record.bmi = bmi;
      record.bmiStatus = status;
    }

    this.validateDate(input.measurementDate);

    return customersRepo.save(record);
  }

  private static ensureValidInput(input: UpdateCustomersInputDto): void {
    if (!input.idCustomers) {
      throw new BadRequestException('O campo idCustomers é obrigatório.');
    }

    const hasChanges = ['weightKg', 'observation', 'measurementDate'].some(
      (k) => input[k as keyof UpdateCustomersInputDto] !== undefined,
    );

    if (!hasChanges) {
      throw new BadRequestException('Nenhum campo informado para atualização.');
    }
  }
}