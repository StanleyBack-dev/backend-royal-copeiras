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
import { ILead } from "../interface/lead.interface";
import { LeadStatus } from "../enums/lead-status.enum";
import { LeadSource } from "../enums/lead-source.enum";

@Entity("tb_leads")
export class LeadsEntity implements ILead {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_leads" })
  idLeads!: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idtb_users" })
  user!: UserEntity;

  @Column({ name: "idtb_users", type: "uuid" })
  idUsers!: string;

  @Column({ name: "name", type: "varchar", length: 120 })
  name!: string;

  @Column({ name: "email", type: "varchar", length: 120, nullable: true })
  email?: string;

  @Column({ name: "phone", type: "varchar", length: 20, nullable: true })
  phone?: string;

  @Column({ name: "document", type: "varchar", length: 20, nullable: true })
  document?: string;

  @Column({ name: "source", type: "varchar", length: 60, nullable: true })
  source?: LeadSource;

  @Column({ name: "notes", type: "text", nullable: true })
  notes?: string;

  @Column({
    name: "status",
    type: "enum",
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status!: LeadStatus;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
