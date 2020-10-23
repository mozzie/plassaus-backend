import { MigrationInterface, QueryRunner } from 'typeorm';

class CreateTableGuest1603141940641 implements MigrationInterface {
  up = async (queryRunner: QueryRunner) : Promise<void> => {
    await queryRunner.query(
      'create table `guest`(`id` integer not null auto_increment,'
      + '`name` varchar(100) not null,'
      + '`created` timestamp not null default CURRENT_TIMESTAMP,'
      + '`event_id` integer not null,'
      + '`updated` timestamp null default null,'
      + '`deleted` timestamp null default null,'
      + 'foreign key(`event_id`) references `event`(`id`),'
      + 'primary key(`id`))',
    );
  };

  down = async (queryRunner: QueryRunner) : Promise<void> => {
    await queryRunner.query('drop table `guest`');
  };
}

export default CreateTableGuest1603141940641;
