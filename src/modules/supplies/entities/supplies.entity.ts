import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";
import { ISupply } from "../interface/supply.interface";

const numericTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity("tb_supplies")
@Index("UQ_tb_supplies_user_normalized_name", ["idUsers", "normalizedName"], {
  unique: true,
})
export class SuppliesEntity implements ISupply {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_supplies" })
  idSupplies!: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idtb_users" })
  user!: UserEntity;

  @Column({ name: "idtb_users", type: "uuid" })
  idUsers!: string;

  @Column({ name: "name", type: "varchar", length: 120 })
  name!: string;

  @Column({ name: "normalized_name", type: "varchar", length: 120 })
  normalizedName!: string;

  @Column({ name: "default_unit", type: "varchar", length: 32, nullable: true })
  defaultUnit?: string | null;

  @Column({
    name: "suggested_unit_price",
    type: "numeric",
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  suggestedUnitPrice?: number | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
