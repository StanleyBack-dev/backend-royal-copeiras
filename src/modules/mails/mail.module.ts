import { Module } from "@nestjs/common";
import { BrevoMailProvider } from "./providers/brevo-mail.provider";
import { MAIL_PROVIDER_TOKEN } from "./contracts/mail.tokens";
import { UserOnboardingEmailService } from "./services/user-onboarding-email.service";

@Module({
  providers: [
    {
      provide: MAIL_PROVIDER_TOKEN,
      useClass: BrevoMailProvider,
    },
    UserOnboardingEmailService,
  ],
  exports: [MAIL_PROVIDER_TOKEN, UserOnboardingEmailService],
})
export class MailModule {}
