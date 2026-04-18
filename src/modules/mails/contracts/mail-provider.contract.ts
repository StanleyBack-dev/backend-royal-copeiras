import type { SendMailCommand } from "./send-mail.command";

export interface IMailProvider {
  send(command: SendMailCommand): Promise<void>;
}
