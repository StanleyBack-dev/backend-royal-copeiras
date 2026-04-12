import { BadRequestException } from '@nestjs/common';
import { GetUserInputDto } from '../../dtos/get/get-user-input.dto';

export class GetUserValidator {
  static ensureValidInput(input: GetUserInputDto): void {
    if (!input.idUsers && !input.email) {
      throw new BadRequestException('Informe um ID ou um e-mail para buscar o usuário.');
    }
  }
}