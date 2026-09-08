import { LeadStatus } from "../enums/lead-status.enum";
import { LeadSource } from "../enums/lead-source.enum";

export interface ILead {
  idLeads: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  legalName?: string;
  address?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  source?: LeadSource;
  notes?: string;
  status: LeadStatus;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
