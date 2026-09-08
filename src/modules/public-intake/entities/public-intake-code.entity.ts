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

/**
 * Gates the public "solicitar orçamento" form: an operator issues a code,
 * sends it to a prospect over WhatsApp, and the code (then a short-lived
 * form token once verified) is the only way to reach and submit the form.
 *
 * The code itself is stored in plain text rather than hashed. Unlike the
 * auth password-recovery codes (`AuthVerificationCodeEntity`), there is no
 * known identifier (e.g. an email) to scope a lookup by before comparing —
 * the client only has the code — so a hash would force scanning every open
 * code to find a match. The code gates a low-sensitivity action (filling
 * out a contact form, not an account), and `issueCode` invalidates the
 * operator's previous open code before creating a new one, which keeps the
 * number of codes an attacker could even be guessing against very small.
 */
@Entity("tb_public_intake_codes")
export class PublicIntakeCodeEntity {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_public_intake_codes" })
  idPublicIntakeCodes!: string;

  @ManyToOne(() => UserEntity, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "idtb_users" })
  user?: UserEntity;

  @Column({ name: "idtb_users", type: "uuid", nullable: true })
  idUsers?: string;

  @Column({ name: "code", type: "varchar", length: 12 })
  code!: string;

  @Column({ name: "expires_at", type: "timestamp" })
  expiresAt!: Date;

  @Column({ name: "verified_at", type: "timestamp", nullable: true })
  verifiedAt?: Date | null;

  @Column({ name: "form_token", type: "varchar", nullable: true })
  formToken?: string | null;

  @Column({ name: "form_token_expires_at", type: "timestamp", nullable: true })
  formTokenExpiresAt?: Date | null;

  @Column({ name: "consumed_at", type: "timestamp", nullable: true })
  consumedAt?: Date | null;

  @Column({ name: "invalidated_at", type: "timestamp", nullable: true })
  invalidatedAt?: Date | null;

  @Column({ name: "idtb_leads_result", type: "uuid", nullable: true })
  resultingLeadId?: string | null;

  @Column({ name: "idtb_budgets_result", type: "uuid", nullable: true })
  resultingBudgetId?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
