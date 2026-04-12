import { Injectable, ConflictException } from "@nestjs/common";
import { GetUsersService } from "../services/get/get-users.service";

@Injectable()
export class UserExistsValidator {
  constructor(private readonly getUsersService: GetUsersService) {}

  /**
   * Garante que o e-mail NÃO existe no banco.
   * Se existir, lança 409 (Conflict).
   * Útil para rotas de cadastro manual (se houver).
   */
  async ensureUserDoesNotExistByEmail(email: string): Promise<void> {
    const existing = await this.getUsersService.findByEmail(email);

    if (existing) {
      throw new ConflictException("Este e-mail já está cadastrado.");
    }
  }
}
