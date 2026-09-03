import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";
import { LeadsEntity } from "../../leads/entities/leads.entity";
import { BudgetsEntity } from "../../budgets/entities/budgets.entity";
import { ContractsEntity } from "../../contracts/entities/contracts.entity";
import { EmployeesEntity } from "../../employees/entities/employees.entity";
import { EventEntity } from "../../events/entities/event.entity";
import { PaymentStatus } from "../enums/payment-status.enum";
import { PaymentOrigin } from "../enums/payment-origin.enum";
import type { IPayment } from "../interfaces";
import { PaymentItemEntity } from "./payment-item.entity";

const numericTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity("tb_payments")
export class PaymentsEntity implements IPayment {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_payments" })
  idPayments!: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idtb_users" })
  user!: UserEntity;

  @Column({ name: "idtb_users", type: "uuid" })
  idUsers!: string;

  @ManyToOne(() => LeadsEntity, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "idtb_leads" })
  lead?: LeadsEntity;

  @Column({ name: "idtb_leads", type: "uuid", nullable: true })
  idLeads?: string;

  @ManyToOne(() => BudgetsEntity, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "idtb_budgets" })
  budget?: BudgetsEntity;

  @Column({ name: "idtb_budgets", type: "uuid", nullable: true })
  idBudgets?: string;

  @ManyToOne(() => ContractsEntity, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "idtb_contracts" })
  contract?: ContractsEntity;

  @Column({ name: "idtb_contracts", type: "uuid", nullable: true })
  idContracts?: string;

  @ManyToOne(() => EventEntity, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "idtb_events" })
  event?: EventEntity;

  @Column({ name: "idtb_events", type: "uuid", nullable: true })
  idEvents?: string;

  @ManyToOne(() => EmployeesEntity, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "idtb_employees" })
  employee?: EmployeesEntity;

  @Column({ name: "idtb_employees", type: "uuid", nullable: true })
  idEmployees?: string;

  // `tb_payments` and `tb_payment_items` deliberately share these enum types
  // (see the payments migrations). `enumName` pins them so TypeORM does not try
  // to split them into per-table types on schema sync / migration:generate.
  @Column({
    name: "origin",
    type: "enum",
    enum: PaymentOrigin,
    enumName: "tb_payments_origin_enum",
  })
  origin!: PaymentOrigin;

  @Column({
    name: "status",
    type: "enum",
    enum: PaymentStatus,
    enumName: "tb_payments_status_enum",
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({
    name: "planned_amount",
    type: "numeric",
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  plannedAmount!: number;

  @Column({
    name: "paid_amount",
    type: "numeric",
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0,
    transformer: numericTransformer,
  })
  paidAmount?: number;

  @Column({ name: "payment_date", type: "timestamp", nullable: true })
  paymentDate?: Date;

  @Column({ name: "due_date", type: "date", nullable: true })
  dueDate?: Date;

  @Column({
    name: "proof_url",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  proofUrl?: string;

  @Column({
    name: "notes",
    type: "text",
    nullable: true,
  })
  notes?: string;

  @OneToMany(() => PaymentItemEntity, (item) => item.payment, {
    cascade: false,
  })
  paymentItems?: PaymentItemEntity[];

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
