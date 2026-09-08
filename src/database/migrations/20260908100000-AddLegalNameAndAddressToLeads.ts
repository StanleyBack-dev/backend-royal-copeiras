import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Lets a lead be qualified with its razão social (when it's a company) and
 * full address, so contracts can print a complete CONTRATANTE header
 * instead of just name + document.
 */
export class AddLegalNameAndAddressToLeads20260908100000 implements MigrationInterface {
  name = "AddLegalNameAndAddressToLeads20260908100000";

  private readonly columns: Array<{ name: string; definition: string }> = [
    { name: "legal_name", definition: "varchar(160)" },
    { name: "address", definition: "varchar(255)" },
    { name: "address_city", definition: "varchar(80)" },
    { name: "address_state", definition: "varchar(2)" },
    { name: "address_zip_code", definition: "varchar(9)" },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_leads");
    if (!hasTable) {
      return;
    }

    for (const column of this.columns) {
      const hasColumn = await queryRunner.hasColumn("tb_leads", column.name);
      if (!hasColumn) {
        await queryRunner.query(`
          ALTER TABLE tb_leads
          ADD COLUMN ${column.name} ${column.definition}
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_leads");
    if (!hasTable) {
      return;
    }

    for (const column of this.columns) {
      const hasColumn = await queryRunner.hasColumn("tb_leads", column.name);
      if (hasColumn) {
        await queryRunner.query(`
          ALTER TABLE tb_leads DROP COLUMN ${column.name}
        `);
      }
    }
  }
}
