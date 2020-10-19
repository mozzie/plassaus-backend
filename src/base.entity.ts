import {
  CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted: Date;
}

export default BaseEntity;
