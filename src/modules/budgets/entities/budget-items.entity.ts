import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { BudgetsEntity } from "./budgets.entity";
import { PositionsEntity } from "../../positions/entities/positions.entity";

const numericTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity("tb_budget_items")
export class BudgetItemsEntity {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_budget_items" })
  idBudgetItems!: string;

  @ManyToOne(() => BudgetsEntity, (budget) => budget.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "idtb_budgets" })
  budget!: BudgetsEntity;

  @Column({ name: "idtb_budgets", type: "uuid" })
  idBudgets!: string;

  @ManyToOne(() => PositionsEntity, { onDelete: "RESTRICT", nullable: true })
  @JoinColumn({ name: "idtb_positions" })
  position?: PositionsEntity;

  @Column({ name: "idtb_positions", type: "uuid", nullable: true })
  idPositions?: string | null;

  @Column({ name: "description", type: "varchar", length: 255 })
  description!: string;

  @Column({
    name: "service_gender",
    type: "varchar",
    length: 32,
    nullable: true,
  })
  serviceGender?: string | null;

  @Column({ name: "quantity", type: "int" })
  quantity!: number;

  @Column({
    name: "unit_price",
    type: "numeric",
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  unitPrice!: number;

  @Column({
    name: "total_price",
    type: "numeric",
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  totalPrice!: number;

  @Column({ name: "notes", type: "text", nullable: true })
  notes?: string;

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder!: number;

  @Column({ name: "event_date_index", type: "int", default: 0 })
  eventDateIndex!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
