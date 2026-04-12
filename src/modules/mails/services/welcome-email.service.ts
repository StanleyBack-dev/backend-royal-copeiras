import { Injectable, Inject, Logger } from '@nestjs/common';
import { ISendMailDTO } from '../../../shared/mails/dtos/send-email.dto';
import { getWelcomeEmailTemplate } from '../templates/welcome/welcome-email.template';

@Injectable()
export class WelcomeEmailService {
    private readonly logger = new Logger(WelcomeEmailService.name);

    constructor(
        @Inject('MailProvider')
        private mailProvider: { sendMail: (data: ISendMailDTO) => Promise<void> },
    ) { }

    async send(to: string, name: string) {
        try {
            const body = getWelcomeEmailTemplate(name);

            await this.mailProvider.sendMail({
                to,
                subject: 'Bem-vindo(a) à FitPulse!',
                body
            });

            this.logger.log(`E-mail de boas-vindas enviado para: ${to} and name: ${name}`);
        } catch (error) {
            this.logger.error(`Erro ao enviar e-mail para ${to}: ${error.message}`);
        }
    }
}