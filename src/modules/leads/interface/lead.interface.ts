import { LeadStatus } from "../enums/lead-status.enum";

export interface ILead {
  idLeads: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  source?: string;
  notes?: string;
  status: LeadStatus;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
