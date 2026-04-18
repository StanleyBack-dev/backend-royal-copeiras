import { Module } from "@nestjs/common";
import { BrevoMailProvider } from "./providers/brevo-mail.provider";
import { MAIL_PROVIDER_TOKEN } from "./contracts/mail.tokens";
import { PasswordRecoveryEmailService } from "./services/password-recovery-email.service";
import { UserOnboardingEmailService } from "./services/user-onboarding-email.service";

@Module({
  providers: [
    {
      provide: MAIL_PROVIDER_TOKEN,
      useClass: BrevoMailProvider,
    },
    PasswordRecoveryEmailService,
    UserOnboardingEmailService,
  ],
  exports: [
    MAIL_PROVIDER_TOKEN,
    PasswordRecoveryEmailService,
    UserOnboardingEmailService,
  ],
})
export class MailModule {}
