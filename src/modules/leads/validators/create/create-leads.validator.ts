import { Repository } from "typeorm";
import { LeadsEntity } from "../../entities/leads.entity";
import { CreateLeadsInputDto } from "../../dtos/create/create-leads-input.dto";

export class CreateLeadsValidator {
  static async validateAndCreate(
    userId: string,
    input: CreateLeadsInputDto,
    leadsRepo: Repository<LeadsEntity>,
  ): Promise<LeadsEntity> {
    const newRecord = leadsRepo.create({
      idUsers: userId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      document: input.document,
      legalName: input.legalName,
      address: input.address,
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
