import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventEntity } from "./event.entity";
import { BudgetItemsEntity } from "../../budgets/entities/budget-items.entity";
import { EmployeesEntity } from "../../employees/entities/employees.entity";

const numericTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity("tb_event_assignments")
export class EventAssignmentEntity {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_event_assignments" })
  idEventAssignments!: string;

  @ManyToOne(() => EventEntity, (event) => event.assignments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "idtb_events" })
  event!: EventEntity;

  @Column({ name: "idtb_events", type: "uuid" })
  idEvents!: string;

  @ManyToOne(() => BudgetItemsEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idtb_budget_items" })
  budgetItem!: BudgetItemsEntity;

  @Column({ name: "idtb_budget_items", type: "uuid" })
  idBudgetItems!: string;

  @ManyToOne(() => EmployeesEntity, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "idtb_employees" })
  employee?: EmployeesEntity;

  @Column({ name: "idtb_employees", type: "uuid", nullable: true })
  idEmployees?: string;

  @Column({ name: "allocation_index", type: "int", default: 1 })
  allocationIndex!: number;

  @Column({
    name: "employee_payment",
    type: "numeric",
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  employeePayment!: number;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
