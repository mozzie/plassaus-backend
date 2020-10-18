import {
  Body, Controller, Get, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import EventService from './event.service';
import JwtAuthGuard from '../auth/jwt-auth.guard';
import AuthUser from '../auth/authuser.decorator';
import JwtUser from '../auth/jwtuser.entity';
import EventFilter from './event.filter';
import EventDTO from './event.dto';

@Controller('events')
class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  async createEvent(@AuthUser() jwtUser: JwtUser, @Body() dto: EventDTO) : Promise<EventDTO> {
    return this.eventService.create(dto, jwtUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getEvent(@AuthUser() jwtUser: JwtUser, @Param('id') id: number) : Promise<EventDTO> {
    return this.eventService.findOne(id, jwtUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getEvents(@AuthUser() jwtUser: JwtUser,
    @Query() filter: EventFilter) : Promise<EventDTO[]> {
    return this.eventService.find(EventFilter.sanitized(filter), jwtUser);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateEvent(@AuthUser() jwtUser: JwtUser, @Body() dto: EventDTO, @Param('id') eventId: number) : Promise<void> {
    const sanitizedDTO : EventDTO = (({ id, name }) => ({ id, name }))(dto);
    sanitizedDTO.id = eventId;
    await this.eventService.update(sanitizedDTO, jwtUser);
  }
}

export default EventController;
