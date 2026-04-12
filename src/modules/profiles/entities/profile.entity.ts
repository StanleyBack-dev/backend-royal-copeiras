import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";

@Entity("tb_profiles")
export class ProfileEntity {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_profiles" })
  idProfiles: string;

  @Column({ name: "idtb_users", type: "uuid" })
  idUsers: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: "idtb_users" })
  user: UserEntity;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: "date", nullable: true })
  birthDate?: string;

  @Column({ type: "enum", enum: ["male", "female", "other"], nullable: true })
  sex?: "male" | "female" | "other";

  @Column({ name: "height_m", type: "float", nullable: true })
  heightM?: number;

  @Column({
    type: "enum",
    enum: ["sedentary", "light", "moderate", "active", "very_active"],
    nullable: true,
  })
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";

  @Column({
    type: "enum",
    enum: ["lose_weight", "maintain", "gain_weight"],
    nullable: true,
  })
  goal?: "lose_weight" | "maintain" | "gain_weight";

  @Column({ name: "ip_address", nullable: true })
  ipAddress?: string;

  @Column({ name: "user_agent", nullable: true })
  userAgent?: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;
}
