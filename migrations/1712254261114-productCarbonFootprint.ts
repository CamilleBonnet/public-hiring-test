import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductCarbonFootprint1712254261114 implements MigrationInterface {
    name = 'ProductCarbonFootprint1712254261114'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_carbon_footprints" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "ingredients" character varying NOT NULL, "score" double precision, CONSTRAINT "PK_44835671561a678a9a5c10ddbe0" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product_carbon_footprints"`);
    }

}
