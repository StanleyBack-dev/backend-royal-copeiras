import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCompanyProfileTable20260903120000 implements MigrationInterface {
  name = "CreateCompanyProfileTable20260903120000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_company_profile");
    if (hasTable) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE tb_company_profile (
        idtb_company_profile uuid PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::uuid),
        legal_name varchar(160) NOT NULL,
        trade_name varchar(160) NOT NULL,
        document varchar(20) NOT NULL,
        state_registration varchar(30),
        municipal_registration varchar(30),
        email varchar(120),
        phone varchar(20),
        address varchar(255),
        address_city varchar(80),
        address_state varchar(2),
        address_zip_code varchar(9),
        representative_name varchar(120),
        representative_role varchar(80),
        representative_document varchar(20),
        pix_key varchar(120),
        pix_key_type varchar(20),
        issue_city varchar(80),
        website varchar(120),
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      INSERT INTO tb_company_profile (
        legal_name,
        trade_name,
        document,
        email,
        address_city,
        address_state,
        representative_name,
        representative_role,
        pix_key,
        pix_key_type,
        issue_city
      ) VALUES (
        'Estevam Barros Rodrigues',
        'Royal Copeiras',
        '64.062.038/0001-71',
        'royalcopeiras@gmail.com',
        'Goiânia',
        'GO',
        'Estevam Barros Rodrigues',
        'Titular',
        '64.062.038/0001-71',
        'cnpj',
        'Goiânia'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tb_company_profile CASCADE`);
  }
}
