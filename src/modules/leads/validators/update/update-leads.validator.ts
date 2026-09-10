import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { LeadsEntity } from "../../entities/leads.entity";
import { UpdateLeadsInputDto } from "../../dtos/update/update-leads-input.dto";
import { LeadStatus } from "../../enums/lead-status.enum";
import { findDuplicateLead } from "../base/lead-duplicate.util";

const LEAD_ALLOWED_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  [LeadStatus.NEW]: [LeadStatus.QUALIFIED, LeadStatus.WON, LeadStatus.LOST],
  [LeadStatus.QUALIFIED]: [LeadStatus.WON, LeadStatus.LOST],
  [LeadStatus.WON]: [],
  [LeadStatus.LOST]: [],
};

export class UpdateLeadsValidator {
  static async validateAndUpdate(
    userId: string,
    input: UpdateLeadsInputDto,
    leadsRepo: Repository<LeadsEntity>,
  ): Promise<LeadsEntity> {
    if (!input.idLeads) {
      throw AppException.from(APP_ERRORS.leads.idRequired, undefined);
    }

    const record = await leadsRepo.findOne({
      where: { idLeads: input.idLeads },
    });

    if (!record) {
      throw AppException.from(APP_ERRORS.leads.notFound, undefined);
    }

    const hasUpdateData = Object.entries(input).some(
      ([key, value]) => key !== "idLeads" && value !== undefined,
    );

    if (!hasUpdateData) {
      throw AppException.from(APP_ERRORS.leads.noUpdateData, undefined);
    }

    const nextName = input.name ?? record.name;
    const nextDocument =
      input.document !== undefined ? input.document : record.document;
    const touchesIdentity =
      input.name !== undefined || input.document !== undefined;

    if (touchesIdentity) {
      const duplicate = await findDuplicateLead(leadsRepo, {
        name: nextName,
        document: nextDocument,
        excludeId: record.idLeads,
      });

      if (duplicate) {
        throw AppException.from(APP_ERRORS.leads.duplicate, undefined);
      }
    }

    if (input.status && input.status !== record.status) {
      const allowedNextStatuses = LEAD_ALLOWED_TRANSITIONS[record.status] ?? [];
      const canTransition = allowedNextStatuses.includes(input.status);

      if (!canTransition) {
        throw AppException.from(
          APP_ERRORS.leads.invalidStatusTransition,
          undefined,
        );
      }
    }

    Object.assign(record, input);
    return leadsRepo.save(record);
  }
}
