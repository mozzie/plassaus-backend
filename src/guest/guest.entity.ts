import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
import GuestDTO from './guest.dto';
import Event from '../event/event.entity';
import BaseEntity from '../base.entity';

@Entity('guest')
class Guest extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Event, (event) => event.guests)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  setDTO(dto: GuestDTO) : void {
    this.name = dto.name;
  }

  getDTO() : GuestDTO {
    const dto : GuestDTO = new GuestDTO();
    dto.id = this.id;
    dto.name = this.name;
    return dto;
  }
}

export default Guest;
