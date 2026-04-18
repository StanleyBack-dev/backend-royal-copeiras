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
import { IBudget } from "../interface/budget.interface";
import { BudgetStatus } from "../enums/budget-status.enum";
import { BudgetItemsEntity } from "./budgetItems.entity";

const numericTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity("tb_budgets")
export class BudgetsEntity implements Omit<IBudget, "items"> {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_budgets" })
  idBudgets!: string;

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

  @Column({ name: "budget_number", type: "varchar", length: 30, unique: true })
  budgetNumber!: string;

  @Column({
    name: "status",
    type: "enum",
    enum: BudgetStatus,
    default: BudgetStatus.DRAFT,
  })
  status!: BudgetStatus;

  @Column({ name: "issue_date", type: "date" })
  issueDate!: Date;

  @Column({ name: "valid_until", type: "date" })
  validUntil!: Date;

  @Column({ name: "event_dates", type: "text", array: true, default: "{}" })
  eventDates!: string[];

  @Column({
    name: "event_location",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  eventLocation?: string;

  @Column({ name: "guest_count", type: "int", nullable: true })
  guestCount?: number;

  @Column({ name: "duration_hours", type: "int", nullable: true })
  durationHours?: number;

  @Column({
    name: "payment_method",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  paymentMethod?: string;

  @Column({
    name: "advance_percentage",
    type: "numeric",
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  advancePercentage?: number;

  @Column({ name: "notes", type: "text", nullable: true })
  notes?: string;

  @Column({
    name: "subtotal",
    type: "numeric",
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  subtotal!: number;

  @Column({
    name: "total_amount",
    type: "numeric",
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  totalAmount!: number;

  @Column({ name: "pdf_url", type: "varchar", length: 500, nullable: true })
  pdfUrl?: string;

  @Column({ name: "pdf_hash", type: "varchar", length: 128, nullable: true })
  pdfHash?: string;

  @Column({ name: "pdf_snapshot", type: "jsonb", nullable: true })
  pdfSnapshot?: unknown;

  @Column({ name: "pdf_frozen_at", type: "timestamptz", nullable: true })
  pdfFrozenAt?: Date;

  @OneToMany(
    () => BudgetItemsEntity,
    (item: BudgetItemsEntity) => item.budget,
    {
      cascade: false,
    },
  )
  items?: BudgetItemsEntity[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
