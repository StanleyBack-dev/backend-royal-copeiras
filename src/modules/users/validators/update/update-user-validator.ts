import { BadRequestException } from '@nestjs/common';
import { UpdateUserInputDto } from '../../dtos/update/update-user-input.dto';

export class UpdateUserValidator {
  static ensureValidUpdate(input: UpdateUserInputDto): void {
    if (!input.name && !input.urlAvatar && input.status === undefined) {
      throw new BadRequestException('Nenhum campo válido foi informado para atualização.');
    }
  }
}