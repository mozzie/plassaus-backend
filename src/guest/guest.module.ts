import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import GuestController from './guest.controller';
import GuestService from './guest.service';
import Guest from './guest.entity';
import EventService from '../event/event.service';
import Event from '../event/event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guest]),
    TypeOrmModule.forFeature([Event]),
  ],
  controllers: [GuestController],
  providers: [GuestService, EventService],
})
class GuestModule {}

export default GuestModule;
