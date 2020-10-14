import { MigrationInterface, QueryRunner } from 'typeorm';

class CreateTableUser1601652710742 implements MigrationInterface {
  up = async (queryRunner: QueryRunner) : Promise<void> => {
    await queryRunner.query(
      'create table `user`(`id` integer not null auto_increment,'
      + '`name` varchar(100) not null,'
      + '`email` varchar(100) not null,'
      + '`password` varchar(100) not null,'
      + 'primary key(`id`))',
    );
  };

  down = async (queryRunner: QueryRunner) : Promise<void> => {
    await queryRunner.query('drop table `user`');
  };
}

export default CreateTableUser1601652710742;
