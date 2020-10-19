import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Event from './event.entity';
import User from '../user/user.entity';
import EventDTO from './event.dto';
import JwtUser from '../auth/jwtuser.entity';
import EventFilter from './event.filter';

@Injectable()
class EventService {
  constructor(
    @InjectRepository(Event) private readonly eventRepository: Repository<Event>,
  ) {}

  async create(dto: EventDTO, jwtUser: JwtUser) : Promise<EventDTO> {
    const event : Event = new Event();
    event.setDTO(dto);
    event.owner = { id: jwtUser.id } as User;
    await this.eventRepository.save(event);
    return event.getDTO();
  }

  async findOne(id: number, jwtUser: JwtUser) : Promise<EventDTO> {
    const event = await this.eventRepository.findOneOrFail({ id, owner: { id: jwtUser.id } });
    return event.getDTO();
  }

  async find(filter: EventFilter, jwtUser: JwtUser) : Promise<EventDTO[]> {
    let query = this.eventRepository.createQueryBuilder('event');
    query = query.where({ owner: { id: jwtUser.id } });
    if (filter.name) {
      query.andWhere('event.name like :name', { name: `%${filter.name}%` });
    }
    query = query.skip(filter.page * filter.pageSize)
      .take(filter.pageSize)
      .orderBy({ [filter.sortBy]: filter.sortOrder });
    const events : Event[] = await query.getMany();
    return events.map((event) => event.getDTO());
  }

  async update(dto: EventDTO, jwtUser: JwtUser) : Promise<void> {
    await this.findOne(dto.id, jwtUser); // checks for existence and access rights
    await this.eventRepository.update({ id: dto.id, owner: { id: jwtUser.id } }, dto);
  }

  async delete(id: number, jwtUser: JwtUser) : Promise<void> {
    await this.findOne(id, jwtUser); // checks for existence and access rights
    await this.eventRepository.softDelete(id);
  }
}

export default EventService;
