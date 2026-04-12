import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository, Between } from 'typeorm';
import { CustomersEntity } from '../../entities/customers.entity';
import { GetCustomersInputDto } from '../../dtos/get/get-customers-input.dto';

export class GetCustomersValidator {

  static async validateAndFetchRecords(
    userId: string,
    input: GetCustomersInputDto,
    repo: Repository<CustomersEntity>,
  ): Promise<CustomersEntity[]> {
    this.validateDateRange(input);

    if (input.idCustomers) {
      const record = await repo.findOne({ where: { idCustomers: input.idCustomers, idUsers: userId } });
      if (!record) throw new NotFoundException('Registro de saúde não encontrado.');
      return [record];
    }

    if (input.startDate && input.endDate) {
      const records = await repo.find({
        where: {
          idUsers: userId,
          measurementDate: Between(input.startDate, input.endDate),
        },
        order: { measurementDate: 'DESC' },
      });

      if (!records.length) {
        throw new NotFoundException('Nenhum registro de saúde encontrado nesse intervalo.');
      }

      return records;
    }

    const records = await repo.find({
      where: { idUsers: userId },
      order: { measurementDate: 'DESC' },
    });

    if (!records.length) {
      throw new NotFoundException('Nenhum registro de saúde encontrado.');
    }

    return records;
  }

  private static validateDateRange(input: GetCustomersInputDto): void {
    if (input.startDate && input.endDate) {
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);

      if (start > end) {
        throw new BadRequestException('A data inicial não pode ser posterior à data final.');
      }
    }
  }
}