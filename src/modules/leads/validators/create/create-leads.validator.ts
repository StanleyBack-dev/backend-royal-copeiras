import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { LeadsEntity } from "../../entities/leads.entity";
import { CreateLeadsInputDto } from "../../dtos/create/create-leads-input.dto";
import { findDuplicateLead } from "../base/lead-duplicate.util";

export class CreateLeadsValidator {
  static async validateAndCreate(
    userId: string,
    input: CreateLeadsInputDto,
    leadsRepo: Repository<LeadsEntity>,
  ): Promise<LeadsEntity> {
    const duplicate = await findDuplicateLead(leadsRepo, {
      name: input.name,
      document: input.document,
    });

    if (duplicate) {
      throw AppException.from(APP_ERRORS.leads.duplicate, undefined);
    }

    const newRecord = leadsRepo.create({
      idUsers: userId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      document: input.document,
      legalName: input.legalName,
      address: input.address,
      addressStreet: input.addressStreet,
      addressNumber: input.addressNumber,
      addressComplement: input.addressComplement,
      addressNeighborhood: input.addressNeighborhood,
      addressCity: input.addressCity,
      addressState: input.addressState,
      addressZipCode: input.addressZipCode,
      source: input.source,
      notes: input.notes,
      status: input.status,
      isActive: input.isActive,
    });

    return leadsRepo.save(newRecord);
  }
}
