import { EventStatus } from "../enums/event-status.enum";

export interface IEvent {
  idEvents: string;
  idContracts: string;
  idBudgets: string;
  idLeads?: string;
  idCustomers?: string;
  status: EventStatus;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
