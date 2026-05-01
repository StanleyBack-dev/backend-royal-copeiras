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
import { ContractsEntity } from "../../contracts/entities/contracts.entity";
import { BudgetsEntity } from "../../budgets/entities/budgets.entity";
import { LeadsEntity } from "../../leads/entities/leads.entity";
import { CustomersEntity } from "../../customers/entities/customers.entity";
import { EventStatus } from "../enums/event-status.enum";
import { EventAssignmentEntity } from "./event-assignment.entity";

@Entity("tb_events")
export class EventEntity {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_events" })
  idEvents!: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idtb_users" })
  user!: UserEntity;

  @Column({ name: "idtb_users", type: "uuid" })
  idUsers!: string;

  @ManyToOne(() => ContractsEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idtb_contracts" })
  contract!: ContractsEntity;

  @Column({ name: "idtb_contracts", type: "uuid", unique: true })
  idContracts!: string;

  @ManyToOne(() => BudgetsEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idtb_budgets" })
  budget!: BudgetsEntity;

  @Column({ name: "idtb_budgets", type: "uuid" })
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

  @Column({
    name: "status",
    type: "enum",
    enum: EventStatus,
    default: EventStatus.SCHEDULED,
  })
  status!: EventStatus;

  @Column({ name: "notes", type: "text", nullable: true })
  notes?: string;

  @OneToMany(() => EventAssignmentEntity, (assignment) => assignment.event)
  assignments?: EventAssignmentEntity[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
