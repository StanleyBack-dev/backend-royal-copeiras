import { BadRequestException } from '@nestjs/common';

export class CustomersBaseValidator {
  static validateRanges(weightKg?: number): void {
    if (weightKg !== undefined && (weightKg < 20 || weightKg > 300)) {
      throw new BadRequestException('Peso deve estar entre 20kg e 300kg.');
    }
  }

  static validateDate(date?: string | Date): void {
    if (!date) return;

    const dateObj = new Date(date);
    const now = new Date();

    if (isNaN(dateObj.getTime())) {
      throw new BadRequestException('Data inválida.');
    }

    if (dateObj > now) {
      throw new BadRequestException('A data da medição não pode ser no futuro.');
    }
  }
}