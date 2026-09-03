import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ICompanyProfile } from "../interface/company-profile.interface";

@Entity("tb_company_profile")
export class CompanyProfileEntity implements ICompanyProfile {
  @PrimaryGeneratedColumn("uuid", { name: "idtb_company_profile" })
  idCompanyProfile!: string;

  @Column({ name: "legal_name", type: "varchar", length: 160 })
  legalName!: string;

  @Column({ name: "trade_name", type: "varchar", length: 160 })
  tradeName!: string;

  @Column({ name: "document", type: "varchar", length: 20 })
  document!: string;

  @Column({
    name: "state_registration",
    type: "varchar",
    length: 30,
    nullable: true,
  })
  stateRegistration?: string;

  @Column({
    name: "municipal_registration",
    type: "varchar",
    length: 30,
    nullable: true,
  })
  municipalRegistration?: string;

  @Column({ name: "email", type: "varchar", length: 120, nullable: true })
  email?: string;

  @Column({ name: "phone", type: "varchar", length: 20, nullable: true })
  phone?: string;

  @Column({ name: "address", type: "varchar", length: 255, nullable: true })
  address?: string;

  @Column({
    name: "address_city",
    type: "varchar",
    length: 80,
    nullable: true,
  })
  addressCity?: string;

  @Column({
    name: "address_state",
    type: "varchar",
    length: 2,
    nullable: true,
  })
  addressState?: string;

  @Column({
    name: "address_zip_code",
    type: "varchar",
    length: 9,
    nullable: true,
  })
  addressZipCode?: string;

  @Column({
    name: "representative_name",
    type: "varchar",
    length: 120,
    nullable: true,
  })
  representativeName?: string;

  @Column({
    name: "representative_role",
    type: "varchar",
    length: 80,
    nullable: true,
  })
  representativeRole?: string;

  @Column({
    name: "representative_document",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  representativeDocument?: string;

  @Column({ name: "pix_key", type: "varchar", length: 120, nullable: true })
  pixKey?: string;

  @Column({
    name: "pix_key_type",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  pixKeyType?: string;

  @Column({ name: "issue_city", type: "varchar", length: 80, nullable: true })
  issueCity?: string;

  @Column({ name: "website", type: "varchar", length: 120, nullable: true })
  website?: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
