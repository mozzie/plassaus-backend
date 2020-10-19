import { MigrationInterface, QueryRunner } from 'typeorm';

class AddTimestampColumnsToUser1603131491906 implements MigrationInterface {
  up = async (queryRunner: QueryRunner) : Promise<void> => {
    await queryRunner.query(
      'ALTER TABLE `user` ADD COLUMN ('
      + '`created` timestamp not null DEFAULT CURRENT_TIMESTAMP,'
      + '`updated` timestamp null default null,'
      + '`deleted` timestamp null default null)',
    );
  };

  down = async (queryRunner: QueryRunner) : Promise<void> => {
    await queryRunner.query(
      'ALTER TABLE `user`'
      + ' DROP COLUMN `created`,'
      + ' DROP COLUMN `updated`,'
      + ' DROP COLUMN `deleted`',
    );
  };
}

export default AddTimestampColumnsToUser1603131491906;
