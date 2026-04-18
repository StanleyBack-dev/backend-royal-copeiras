import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { IMailProvider } from "../contracts/mail-provider.contract";
import { MAIL_PROVIDER_TOKEN } from "../contracts/mail.tokens";
import { buildPasswordRecoveryEmail } from "../templates/password-recovery/password-recovery-email.template";

interface SendPasswordRecoveryEmailInput {
  to: string;
  name: string;
  username: string;
  code: string;
  expiresAt: Date;
}

@Injectable()
export class PasswordRecoveryEmailService {
  constructor(
    @Inject(MAIL_PROVIDER_TOKEN)
    private readonly mailProvider: IMailProvider,
    private readonly configService: ConfigService,
  ) {}

  async send(input: SendPasswordRecoveryEmailInput): Promise<void> {
    const appUrl =
      this.configService.get<string>("FRONTEND_URL") || "http://localhost:3000";

    const emailTemplate = buildPasswordRecoveryEmail({
      appUrl,
      code: input.code,
      expiresAt: input.expiresAt,
      name: input.name,
      username: input.username,
    });

    await this.mailProvider.send({
      to: {
        email: input.to,
        name: input.name,
      },
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
  }
}
