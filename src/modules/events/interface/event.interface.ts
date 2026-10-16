import { EventStatus } from "../enums/event-status.enum";
import { IEventExtraExpense } from "./event-extra-expense.interface";

export interface IEvent {
  idEvents: string;
  eventNumber?: string;
  idContracts: string;
  idBudgets: string;
  idLeads?: string;
  idCustomers?: string;
  status: EventStatus;
  notes?: string;
  overtimeMinutes?: number;
  overtimeHourlyRate?: number;
  extraExpenses?: IEventExtraExpense[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
