import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('tb_customers')
export class CustomersEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'idtb_customers' })
  idCustomers!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idtb_users' })
  user!: UserEntity;

  @Column({ name: 'idtb_users', type: 'uuid' })
  idUsers!: string;

  @Column({ name: 'weight_kg', type: 'float' })
  weightKg!: number;

  @Column({ name: 'bmi', type: 'float' })
  bmi!: number;

  @Column({ name: 'bmi_status', length: 50 })
  bmiStatus!: string;

  @Column({ name: 'observation', type: 'text', nullable: true })
  observation?: string;

  @Column({ name: 'measurement_date', type: 'date' })
  measurementDate!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}