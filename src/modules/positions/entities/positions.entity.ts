import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";
import { IPosition } from "../interface/position.interface";
import { EmployeesEntity } from "../../employees/entities/employees.entity";

@Entity("tb_positions")
@Index("UQ_tb_positions_user_normalized_name", ["idUsers", "normalizedName"], {
  unique: true,
})
export class PositionsEntity implements IPosition {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_positions" })
  idPositions!: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idtb_users" })
  user!: UserEntity;

  @Column({ name: "idtb_users", type: "uuid" })
  idUsers!: string;

  @Column({ name: "name", type: "varchar", length: 120 })
  name!: string;

  @Column({ name: "normalized_name", type: "varchar", length: 120 })
  normalizedName!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => EmployeesEntity, (employee) => employee.position)
  employees?: EmployeesEntity[];

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
