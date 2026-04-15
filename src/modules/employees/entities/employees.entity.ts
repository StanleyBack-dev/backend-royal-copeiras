import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";
import { IEmployee } from "../interface/employee.interface";

@Entity("tb_employees")
export class EmployeesEntity implements IEmployee {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_employees" })
  idEmployees!: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idtb_users" })
  user!: UserEntity;

  @Column({ name: "idtb_users", type: "uuid" })
  idUsers!: string;

  @Column({ name: "name", type: "varchar", length: 120 })
  name!: string;

  @Column({ name: "document", type: "varchar", length: 20, unique: true })
  document!: string;

  @Column({ name: "email", type: "varchar", length: 120, nullable: true })
  email?: string;

  @Column({ name: "phone", type: "varchar", length: 20, nullable: true })
  phone?: string;

  @Column({ name: "position", type: "varchar", length: 100 })
  position!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
