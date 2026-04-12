import { Module } from '@nestjs/common';
import { BrevoMailProvider } from '../../shared/mails/providers/brevo-mail.provider';
import { WelcomeEmailService } from './services/welcome-email.service';

@Module({
    providers: [
        {
            provide: 'MailProvider',
            useClass: BrevoMailProvider,
        },
        WelcomeEmailService,
    ],
    exports: [WelcomeEmailService],
})

export class MailModule { }