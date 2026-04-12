import { Injectable } from '@nestjs/common';
import { IMailProvider } from '../models/mail.provider';
import { ISendMailDTO } from '../dtos/send-email.dto';
import SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class BrevoMailProvider implements IMailProvider {
    private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

    constructor() {
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.BREVO_API_KEY || '';

        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    }

    async sendMail({ to, subject, body, from }: ISendMailDTO): Promise<void> {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.to = [{ email: to }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = body;
        sendSmtpEmail.sender = { email: from || 'no-reply@fitpulseio.com.br', name: 'FitPulse' };

        await this.apiInstance.sendTransacEmail(sendSmtpEmail);
    }
}