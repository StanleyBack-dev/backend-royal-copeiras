import { Injectable } from "@nestjs/common";
import { AuthCredentialsService } from "./auth-credentials.service";
import { PasswordHasherService } from "./password-hasher.service";

interface ProvisionAuthCredentialsInput {
  idUsers: string;
  username: string;
}

@Injectable()
export class ProvisionAuthCredentialsService {
  constructor(
    private readonly authCredentialsService: AuthCredentialsService,
    private readonly passwordHasherService: PasswordHasherService,
  ) {}

  async execute(input: ProvisionAuthCredentialsInput) {
    const temporaryPassword =
      this.passwordHasherService.generateTemporaryPassword();
    const passwordHash =
      await this.passwordHasherService.hashPassword(temporaryPassword);

    const credential = await this.authCredentialsService.provisionCredential({
      idUsers: input.idUsers,
      username: input.username,
      passwordHash,
    });

    return {
      credential,
      temporaryPassword,
    };
  }
}
