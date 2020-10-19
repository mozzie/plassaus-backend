import { Repository } from 'typeorm';
import EventController from './event.controller';
import EventService from './event.service';
import Event from './event.entity';
import EventDTO from './event.dto';
import JwtUser from '../auth/jwtuser.entity';
import EventFilter from './event.filter';

describe('EventController', () => {
  let controller: EventController;
  let eventService: EventService;
  let eventRepository: Repository<Event>;
  beforeEach(() => {
    eventService = new EventService(eventRepository);
    controller = new EventController(eventService);
  });

  describe('createEvent', () => {
    it('should call eventService.create', async () => {
      const createSpy = jest.spyOn(eventService, 'create').mockImplementation(async (data) => Promise.resolve(data));
      expect(createSpy).toHaveBeenCalledTimes(0);
      await controller.createEvent(new JwtUser(), new EventDTO())
        .then(() => expect(createSpy).toHaveBeenCalledTimes(1));
    });
  });

  describe('getEvent', () => {
    it('should call eventService.findOne', async () => {
      const createSpy = jest.spyOn(eventService, 'findOne').mockImplementation(async () => Promise.resolve(new EventDTO()));
      expect(createSpy).toHaveBeenCalledTimes(0);
      await controller.getEvent(new JwtUser(), 1)
        .then(() => expect(createSpy).toHaveBeenCalledTimes(1));
    });
  });

  describe('getEvents', () => {
    it('should call eventService.find', async () => {
      const createSpy = jest.spyOn(eventService, 'find').mockImplementation(async () => Promise.resolve([new EventDTO()]));
      expect(createSpy).toHaveBeenCalledTimes(0);
      await controller.getEvents(new JwtUser(), new EventFilter())
        .then(() => expect(createSpy).toHaveBeenCalledTimes(1));
    });
  });

  describe('updateEvent', () => {
    it('should call eventService.update', async () => {
      const createSpy = jest.spyOn(eventService, 'update').mockImplementation(async () => Promise.resolve());
      expect(createSpy).toHaveBeenCalledTimes(0);
      await controller.updateEvent(new JwtUser(), new EventDTO(), 1)
        .then(() => expect(createSpy).toHaveBeenCalledTimes(1));
    });

    describe('deleteEvent', () => {
      it('should call eventService.delete', async () => {
        const deleteSpy = jest.spyOn(eventService, 'delete').mockImplementation(async () => Promise.resolve());
        expect(deleteSpy).toHaveBeenCalledTimes(0);
        await controller.deleteEvent(new JwtUser(), 1)
          .then(() => expect(deleteSpy).toHaveBeenCalledTimes(1));
      });
    });
  });
});
