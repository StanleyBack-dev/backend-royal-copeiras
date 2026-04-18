import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { sanitizeSensitiveData } from "../../../../common/security/sanitize-sensitive-data";
import { UserEntity } from "../../../users/entities/user.entity";
import { PasswordRecoveryEmailService } from "../../../mails/services/password-recovery-email.service";
import { AuthCredentialsService } from "../auth-credentials.service";
import { PasswordRecoveryCodesService } from "./password-recovery-codes.service";

@Injectable()
export class RequestPasswordRecoveryService {
  private readonly logger = new Logger(RequestPasswordRecoveryService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authCredentialsService: AuthCredentialsService,
    private readonly passwordRecoveryCodesService: PasswordRecoveryCodesService,
    private readonly passwordRecoveryEmailService: PasswordRecoveryEmailService,
  ) {}

  async execute(email: string): Promise<void> {
    const normalizedEmail =
      this.passwordRecoveryCodesService.normalizeEmail(email);

    const user = await this.userRepository.findOne({
      where: { email: ILike(normalizedEmail) },
    });

    if (!user || !user.status || user.inactivatedAt) {
      return;
    }

    const credential = await this.authCredentialsService.findByUserId(
      user.idUsers,
    );

    if (!credential) {
      return;
    }

    const { code, expiresAt } =
      await this.passwordRecoveryCodesService.issuePasswordRecoveryCode(user);

    try {
      await this.passwordRecoveryEmailService.send({
        to: user.email,
        name: user.name,
        code,
        expiresAt,
        username: credential.username,
      });
    } catch (error) {
      this.logger.error(
        "Failed to send password recovery email",
        sanitizeSensitiveData({
          userId: user.idUsers,
          email: user.email,
          error,
        }),
      );
    }
  }
}
