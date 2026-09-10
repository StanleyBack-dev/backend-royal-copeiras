import { LeadsEntity } from "../entities/leads.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { LeadStatus } from "../enums/lead-status.enum";
import { LeadSource } from "../enums/lead-source.enum";

export const leadMock: LeadsEntity = {
  idLeads: "lead-1",
  idUsers: "user-1",
  user: { idUsers: "user-1" } as UserEntity,
  name: "Lead Test",
  email: "lead@test.com",
  phone: "62999990000",
  document: "12345678901",
  addressStreet: "Rua 6",
  addressNumber: "SN",
  addressComplement: "Quadra 22 Lote 03",
  addressNeighborhood: "Polo Empresarial",
  addressCity: "Aparecida de Goiânia",
  addressState: "GO",
  addressZipCode: "74985-105",
  source: LeadSource.INSTAGRAM,
  notes: "note",
  status: LeadStatus.NEW,
  isActive: true,
  createdAt: new Date("2026-04-10T10:00:00.000Z"),
  updatedAt: new Date("2026-04-10T10:00:00.000Z"),
};
