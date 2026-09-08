import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { IMailProvider } from "../contracts/mail-provider.contract";
import { MAIL_PROVIDER_TOKEN } from "../contracts/mail.tokens";
import { buildPublicBudgetRequestNotificationEmail } from "../templates/public-intake/public-budget-request-notification-email.template";
import { COMPANY_PROFILE_DEFAULTS } from "../../company-profile/constants/company-profile-defaults.constant";

interface SendPublicBudgetRequestNotificationInput {
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  leadDocument?: string;
  idBudgets: string;
  budgetNumber: string;
  eventDates: string[];
  eventArrivalTimes: string[];
  eventDepartureTimes: string[];
  eventLocation: string[];
  guestCount: number[];
  durationHours: number[];
  items: Array<{
    description: string;
    serviceGender?: string | null;
    quantity: number;
    eventDateIndex: number;
  }>;
}

@Injectable()
export class PublicBudgetRequestNotificationEmailService {
  constructor(
    @Inject(MAIL_PROVIDER_TOKEN)
    private readonly mailProvider: IMailProvider,
    private readonly configService: ConfigService,
  ) {}

  async send(input: SendPublicBudgetRequestNotificationInput): Promise<void> {
    const frontendUrl =
      this.configService.get<string>("FRONTEND_URL") || "http://localhost:3000";
    const budgetUrl = `${frontendUrl.replace(/\/$/, "")}/orcamentos/${input.idBudgets}/edit`;

    const emailTemplate = buildPublicBudgetRequestNotificationEmail({
      leadName: input.leadName,
      leadEmail: input.leadEmail,
      leadPhone: input.leadPhone,
      leadDocument: input.leadDocument,
      budgetNumber: input.budgetNumber,
      budgetUrl,
      eventDates: input.eventDates,
      eventArrivalTimes: input.eventArrivalTimes,
      eventDepartureTimes: input.eventDepartureTimes,
      eventLocation: input.eventLocation,
      guestCount: input.guestCount,
      durationHours: input.durationHours,
      items: input.items,
    });

    await this.mailProvider.send({
      to: {
        email: COMPANY_PROFILE_DEFAULTS.email ?? "royalcopeiras@gmail.com",
        name: COMPANY_PROFILE_DEFAULTS.tradeName,
      },
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
  }
}
