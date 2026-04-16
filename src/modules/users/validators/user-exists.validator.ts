import { Injectable } from "@nestjs/common";
import { AppException } from "../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../common/exceptions/app-errors.catalog";
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
      throw AppException.from(APP_ERRORS.users.emailAlreadyExists, undefined);
    }
  }
}
