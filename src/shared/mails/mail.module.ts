import { Module } from '@nestjs/common';
import { BrevoMailProvider } from './providers/brevo-mail.provider';
import { WelcomeEmailService } from '../../modules/mails/services/welcome-email.service';

@Module({
    providers: [
        {
            provide: 'MailProvider',
            useClass: BrevoMailProvider,
        },
        WelcomeEmailService,
    ],
    exports: ['MailProvider', WelcomeEmailService],
})

export class MailModule { }