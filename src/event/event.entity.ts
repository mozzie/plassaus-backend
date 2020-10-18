import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryColumn,
} from 'typeorm';
import EventDTO from './event.dto';
import User from '../user/user.entity';

@Entity('event')
class Event {
  @PrimaryColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  setDTO(dto: EventDTO) : void {
    this.name = dto.name;
  }

  getDTO() : EventDTO {
    const dto : EventDTO = new EventDTO();
    dto.id = this.id;
    dto.name = this.name;
    return dto;
  }
}

export default Event;
