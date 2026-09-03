import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PaymentOrigin } from "../enums/payment-origin.enum";
import { PaymentStatus } from "../enums/payment-status.enum";
import type { IPaymentItem } from "../interfaces/payment-item.interface";
import { PaymentsEntity } from "./payments.entity";

const numericTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity("tb_payment_items")
export class PaymentItemEntity implements IPaymentItem {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_payment_items" })
  idPaymentItems!: string;

  @ManyToOne(() => PaymentsEntity, (payment) => payment.paymentItems, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "idtb_payments" })
  payment!: PaymentsEntity;

  @Column({ name: "idtb_payments", type: "uuid" })
  idPayments!: string;

  // Shares the enum types declared for `tb_payments` (see the payments
  // migrations). `enumName` keeps TypeORM from creating per-table enum types.
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

  @Column({ name: "proof_url", type: "varchar", length: 500, nullable: true })
  proofUrl?: string;

  @Column({ name: "notes", type: "text", nullable: true })
  notes?: string;

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
