import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";
import { BudgetsEntity } from "../../budgets/entities/budgets.entity";
import { LeadsEntity } from "../../leads/entities/leads.entity";
import { CustomersEntity } from "../../customers/entities/customers.entity";
import { IContract } from "../interface/contract.interface";
import { ContractStatus } from "../enums/contract-status.enum";

@Entity("tb_contracts")
export class ContractsEntity implements IContract {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_contracts" })
  idContracts!: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idtb_users" })
  user!: UserEntity;

  @Column({ name: "idtb_users", type: "uuid" })
  idUsers!: string;

  @ManyToOne(() => BudgetsEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idtb_budgets" })
  budget!: BudgetsEntity;

  @Column({ name: "idtb_budgets", type: "uuid", unique: true })
  idBudgets!: string;

  @ManyToOne(() => LeadsEntity, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "idtb_leads" })
  lead?: LeadsEntity;

  @Column({ name: "idtb_leads", type: "uuid", nullable: true })
  idLeads?: string;

  @ManyToOne(() => CustomersEntity, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "idtb_customers" })
  customer?: CustomersEntity;

  @Column({ name: "idtb_customers", type: "uuid", nullable: true })
  idCustomers?: string;

  @Column({ name: "budget_number", type: "varchar", length: 30 })
  budgetNumber!: string;

  @Column({
    name: "contract_number",
    type: "varchar",
    length: 40,
    unique: true,
  })
  contractNumber!: string;

  @Column({
    name: "status",
    type: "enum",
    enum: ContractStatus,
    default: ContractStatus.GENERATED,
  })
  status!: ContractStatus;

  @Column({ name: "issue_date", type: "date" })
  issueDate!: Date;

  @Column({ name: "valid_until", type: "date", nullable: true })
  validUntil?: Date;

  @Column({ name: "effective_date", type: "date", nullable: true })
  effectiveDate?: Date;

  @Column({ name: "expires_at", type: "date", nullable: true })
  expiresAt?: Date;

  @Column({ name: "body", type: "text", nullable: true })
  body?: string;

  @Column({ name: "template_version", type: "int", default: 1 })
  templateVersion!: number;

  @Column({ name: "retention_until", type: "date", nullable: true })
  retentionUntil?: Date;

  @Column({ name: "sent_via", type: "varchar", length: 20, nullable: true })
  sentVia?: string;

  @Column({ name: "sent_at", type: "timestamp", nullable: true })
  sentAt?: Date;

  @Column({ name: "notes", type: "text", nullable: true })
  notes?: string;

  @Column({
    name: "contract_snapshot",
    type: "jsonb",
    default: () => "'{}'::jsonb",
  })
  contractSnapshot!: Record<string, unknown>;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
