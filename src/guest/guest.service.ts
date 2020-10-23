import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Guest from './guest.entity';
import GuestDTO from './guest.dto';
import GuestFilter from './guest.filter';
import Event from '../event/event.entity';

@Injectable()
class GuestService {
  constructor(
    @InjectRepository(Guest) private readonly guestRepository: Repository<Guest>,
  ) {}

  async create(dto: GuestDTO, eventId: number) : Promise<GuestDTO> {
    const guest : Guest = new Guest();
    guest.setDTO(dto);
    guest.event = { id: eventId } as Event;
    await this.guestRepository.save(guest);
    return guest.getDTO();
  }

  async createBatch(dto: GuestDTO[], eventId: number) : Promise<GuestDTO[]> {
    const guests : Guest[] = dto.map((guestdto) => {
      const guest : Guest = new Guest();
      guest.setDTO(guestdto);
      guest.event = { id: eventId } as Event;
      return guest;
    });
    await this.guestRepository.save(guests);
    return guests.map((guest) => guest.getDTO());
  }

  async findOne(id: number, eventId: number) : Promise<GuestDTO> {
    const guest = await this.guestRepository.findOneOrFail({ id, event: { id: eventId } });
    return guest.getDTO();
  }

  async find(filter: GuestFilter, eventId: number) : Promise<GuestDTO[]> {
    let query = this.guestRepository.createQueryBuilder('guest');
    query = query.where({ event: { id: eventId } });
    if (filter.name) {
      query.andWhere('guest.name like :name', { name: `%${filter.name}%` });
    }
    if (filter.pageSize > 0) {
      query = query.skip(filter.page * filter.pageSize);
      query = query.take(filter.pageSize);
    }
    query = query.orderBy({ [filter.sortBy]: filter.sortOrder });
    const guests : Guest[] = await query.getMany();
    return guests.map((guest) => guest.getDTO());
  }

  async update(dto: GuestDTO, eventId: number) : Promise<void> {
    await this.findOne(dto.id, eventId); // checks for existence and access rights
    await this.guestRepository.update({ id: dto.id, event: { id: eventId } }, dto);
  }

  async delete(id: number, eventId: number) : Promise<void> {
    await this.findOne(id, eventId); // checks for existence and access rights
    await this.guestRepository.softDelete(id);
  }
}

export default GuestService;
