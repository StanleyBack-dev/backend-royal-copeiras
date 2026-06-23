import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ContractsEntity } from "../../contracts/entities/contracts.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { SignatureStatus } from "../enums/signature-status.enum";

@Entity("tb_signatures")
export class SignatureEntity {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_signatures" })
  idSignatures!: string;

  @ManyToOne(() => ContractsEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idtb_contracts" })
  contract!: ContractsEntity;

  @Column({ name: "idtb_contracts", type: "uuid" })
  idContracts!: string;

  @ManyToOne(() => UserEntity, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "idtb_users" })
  user?: UserEntity;

  @Column({ name: "idtb_users", type: "uuid", nullable: true })
  idUsers?: string;

  @Column({ name: "provider", type: "varchar", length: 80 })
  provider!: string;

  @Column({ name: "envelope_id", type: "varchar", length: 120 })
  envelopeId!: string;

  @Column({
    name: "status",
    type: "enum",
    enum: SignatureStatus,
    default: SignatureStatus.PENDING,
  })
  status!: SignatureStatus;

  @Column({
    name: "signed_by_name",
    type: "varchar",
    length: 120,
    nullable: true,
  })
  signedByName?: string;

  @Column({
    name: "signed_by_document",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  signedByDocument?: string;

  @Column({
    name: "signed_by_email",
    type: "varchar",
    length: 120,
    nullable: true,
  })
  signedByEmail?: string;

  @Column({ name: "signer_ip", type: "varchar", length: 60, nullable: true })
  signerIp?: string;

  @Column({
    name: "signer_user_agent",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  signerUserAgent?: string;

  @Column({ name: "signed_at", type: "timestamp", nullable: true })
  signedAt?: Date;

  @Column({ name: "consent_at", type: "timestamp", nullable: true })
  consentAt?: Date;

  @Column({
    name: "signature_url",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  signatureUrl?: string;

  @Column({
    name: "provider_event_id",
    type: "varchar",
    length: 120,
    nullable: true,
  })
  providerEventId?: string;

  @Column({
    name: "provider_signer_id",
    type: "varchar",
    length: 120,
    nullable: true,
  })
  providerSignerId?: string;

  @Column({ name: "signer_index", type: "int", nullable: true })
  signerIndex?: number;

  @Column({
    name: "signer_type",
    type: "enum",
    enum: ["CLIENT", "COMPANY", "OTHER"],
    nullable: true,
  })
  signerType?: "CLIENT" | "COMPANY" | "OTHER";

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
