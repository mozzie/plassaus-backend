import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import EventController from './event.controller';
import EventService from './event.service';
import Event from './event.entity';
import User from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
class EventModule {}

export default EventModule;
