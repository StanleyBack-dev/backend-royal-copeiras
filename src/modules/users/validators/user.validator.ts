import { UserEntity } from '../entities/user.entity';

export class UserValidator {
  static ensureIsActive(user: UserEntity): void {
    if (!user.status) {
      throw new Error('Usuário inativo.');
    }
  }

  static ensureHasEmail(user: UserEntity): void {
    if (!user.email || !user.email.includes('@')) {
      throw new Error('Email inválido.');
    }
  }
}