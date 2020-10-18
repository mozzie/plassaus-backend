import { MigrationInterface, QueryRunner } from 'typeorm';

class CreateTableEvent1602695688931 implements MigrationInterface {
  up = async (queryRunner: QueryRunner) : Promise<void> => {
    await queryRunner.query(
      'create table `event`(`id` integer not null auto_increment,'
      + '`name` varchar(100) not null,'
      + '`owner_id` integer not null,'
      + 'primary key(`id`), '
      + 'foreign key(`owner_id`) references `user`(`id`))',
    );
  };

  down = async (queryRunner: QueryRunner) : Promise<void> => {
    await queryRunner.query('drop table `event`');
  };
}

export default CreateTableEvent1602695688931;
