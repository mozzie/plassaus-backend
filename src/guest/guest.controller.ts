import {
  Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import JwtAuthGuard from '../auth/jwt-auth.guard';
import EventGuard from '../auth/event.guard';
import GuestService from './guest.service';
import GuestFilter from './guest.filter';
import GuestDTO from './guest.dto';
import GuestListDTO from './guestlist.dto';

@UseGuards(JwtAuthGuard, EventGuard)
@Controller('events/:eventId/guests')
class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post('')
  async createGuest(@Param('eventId') eventId: number, @Body() dto: GuestDTO) : Promise<GuestDTO> {
    return this.guestService.create(dto, eventId);
  }

  @Post('/batch')
  async createGuests(@Param('eventId') eventId: number, @Body() dtos: GuestListDTO) : Promise<GuestDTO[]> {
    return this.guestService.createBatch(dtos.guests, eventId);
  }

  @Get(':id')
  async getGuest(@Param('eventId') eventId: number, @Param('id') id: number) : Promise<GuestDTO> {
    return this.guestService.findOne(id, eventId);
  }

  @Get('')
  async getGuests(@Param('eventId') eventId: number,
    @Query() filter: GuestFilter) : Promise<GuestDTO[]> {
    return this.guestService.find(GuestFilter.sanitized(filter), eventId);
  }

  @Put(':id')
  async updateGuest(@Param('eventId') eventId: number, @Body() dto: GuestDTO, @Param('id') guestId: number) : Promise<void> {
    const sanitizedDTO : GuestDTO = (({ id, name }) => ({ id, name }))(dto);
    sanitizedDTO.id = guestId;
    await this.guestService.update(sanitizedDTO, eventId);
  }

  @Delete(':id')
  async deleteGuest(@Param('eventId') eventId: number, @Param('id') guestId: number) : Promise<void> {
    return this.guestService.delete(guestId, eventId);
  }
}

export default GuestController;
