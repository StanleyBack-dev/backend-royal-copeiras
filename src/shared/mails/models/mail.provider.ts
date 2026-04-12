import { ISendMailDTO } from '../dtos/send-email.dto';

export interface IMailProvider {
    sendMail(data: ISendMailDTO): Promise<void>;
}