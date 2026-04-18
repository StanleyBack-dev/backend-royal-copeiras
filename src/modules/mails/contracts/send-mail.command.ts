export interface MailAddress {
  email: string;
  name?: string;
}

export interface SendMailCommand {
  to: MailAddress;
  subject: string;
  html: string;
  text?: string;
  replyTo?: MailAddress;
}
