import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryDefaultToGames1752124803 implements MigrationInterface {
  name = "AddCategoryDefaultToGames1752124803";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add the column as nullable with a default
    await queryRunner.query(
      `ALTER TABLE "games" ADD "category" character varying(50) DEFAULT 'Uncategorized'`
    );
    // 2. Update all existing rows to have the default value
    await queryRunner.query(
      `UPDATE "games" SET "category" = 'Uncategorized' WHERE "category" IS NULL`
    );
    // 3. Set the column to NOT NULL
    await queryRunner.query(
      `ALTER TABLE "games" ALTER COLUMN "category" SET NOT NULL`
    );
    // 4. Remove the default if you don't want it for new rows
    await queryRunner.query(
      `ALTER TABLE "games" ALTER COLUMN "category" DROP DEFAULT`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "category"`);
  }
}
