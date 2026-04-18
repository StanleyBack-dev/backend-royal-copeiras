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
import { IBudgetItem } from "../interface/budget-item.interface";

const numericTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity("tb_budget_items")
export class BudgetItemsEntity implements IBudgetItem {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_budget_items" })
  idBudgetItems!: string;

  @ManyToOne(() => BudgetsEntity, (budget) => budget.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "idtb_budgets" })
  budget!: BudgetsEntity;

  @Column({ name: "idtb_budgets", type: "uuid" })
  idBudgets!: string;

  @Column({ name: "description", type: "varchar", length: 255 })
  description!: string;

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

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
