import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from "typeorm";

@Entity("tb_users")
export class UserEntity {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_users" })
  idUsers!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: "url_avatar", nullable: true })
  urlAvatar?: string;

  @Column({ default: true })
  status!: boolean;

  @Column({ name: "inactivated_at", type: "timestamp", nullable: true })
  inactivatedAt?: Date;

  @Column({ name: "ip_address", nullable: true })
  ipAddress?: string;

  @Column({ name: "user_agent", nullable: true })
  userAgent?: string;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
