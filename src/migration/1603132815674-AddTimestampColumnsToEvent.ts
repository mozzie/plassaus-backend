import { MigrationInterface, QueryRunner } from 'typeorm';

class AddTimestampColumnsToEvent1603132815674 implements MigrationInterface {
  up = async (queryRunner: QueryRunner) : Promise<void> => {
    await queryRunner.query(
      'ALTER TABLE `event` ADD COLUMN ('
      + '`created` timestamp not null DEFAULT CURRENT_TIMESTAMP,'
      + '`updated` timestamp null default null,'
      + '`deleted` timestamp null default null)',
    );
  };

  down = async (queryRunner: QueryRunner) : Promise<void> => {
    await queryRunner.query(
      'ALTER TABLE `event`'
      + ' DROP COLUMN `created`,'
      + ' DROP COLUMN `updated`,'
      + ' DROP COLUMN `deleted`',
    );
  };
}

export default AddTimestampColumnsToEvent1603132815674;
