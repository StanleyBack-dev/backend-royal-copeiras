import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { IMailProvider } from "../contracts/mail-provider.contract";
import { MAIL_PROVIDER_TOKEN } from "../contracts/mail.tokens";
import { buildUserOnboardingEmail } from "../templates/onboarding/user-onboarding-email.template";

interface SendUserOnboardingEmailInput {
  to: string;
  name: string;
  username: string;
  temporaryPassword: string;
}

@Injectable()
export class UserOnboardingEmailService {
  private readonly logger = new Logger(UserOnboardingEmailService.name);

  constructor(
    @Inject(MAIL_PROVIDER_TOKEN)
    private readonly mailProvider: IMailProvider,
    private readonly configService: ConfigService,
  ) {}

  async send(input: SendUserOnboardingEmailInput): Promise<void> {
    const appUrl =
      this.configService.get<string>("FRONTEND_URL") || "http://localhost:3000";

    const emailTemplate = buildUserOnboardingEmail({
      name: input.name,
      username: input.username,
      temporaryPassword: input.temporaryPassword,
      appUrl,
    });

    await this.mailProvider.send({
      to: {
        email: input.to,
        name: input.name,
      },
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      replyTo: this.buildReplyTo(),
    });

    this.logger.log(`Email de onboarding enviado para ${input.to}`);
  }

  private buildReplyTo() {
    const replyToEmail = this.configService.get<string>("MAIL_REPLY_TO_EMAIL");

    if (!replyToEmail) {
      return undefined;
    }

    return {
      email: replyToEmail,
      name:
        this.configService.get<string>("MAIL_REPLY_TO_NAME") ||
        this.configService.get<string>("MAIL_FROM_NAME") ||
        "Royal Copeiras",
    };
  }
}
