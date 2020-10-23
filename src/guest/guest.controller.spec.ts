import { Repository } from 'typeorm';
import GuestController from './guest.controller';
import GuestService from './guest.service';
import Guest from './guest.entity';
import GuestDTO from './guest.dto';
import GuestListDTO from './guestlist.dto';
import GuestFilter from './guest.filter';

describe('GuestController', () => {
  let controller: GuestController;
  let guestService: GuestService;
  let guestRepository: Repository<Guest>;
  beforeEach(() => {
    guestService = new GuestService(guestRepository);
    controller = new GuestController(guestService);
  });

  describe('createGuest', () => {
    it('should call guestService.create', async () => {
      const createSpy = jest.spyOn(guestService, 'create').mockImplementation(async (data) => Promise.resolve(data));
      expect(createSpy).toHaveBeenCalledTimes(0);
      await controller.createGuest(3, new GuestDTO())
        .then(() => expect(createSpy).toHaveBeenCalledTimes(1));
    });
  });

  describe('createGuests', () => {
    it('should call guestService.createBatch', async () => {
      const createSpy = jest.spyOn(guestService, 'createBatch').mockImplementation(async (data) => Promise.resolve(data));
      expect(createSpy).toHaveBeenCalledTimes(0);
      await controller.createGuests(3, new GuestListDTO([new GuestDTO()]))
        .then(() => expect(createSpy).toHaveBeenCalledTimes(1));
    });
  });

  describe('getGuest', () => {
    it('should call guestService.findOne', async () => {
      const createSpy = jest.spyOn(guestService, 'findOne').mockImplementation(async () => Promise.resolve(new GuestDTO()));
      expect(createSpy).toHaveBeenCalledTimes(0);
      await controller.getGuest(3, 1)
        .then(() => expect(createSpy).toHaveBeenCalledTimes(1));
    });
  });

  describe('getGuests', () => {
    it('should call guestService.find', async () => {
      const createSpy = jest.spyOn(guestService, 'find').mockImplementation(async () => Promise.resolve([new GuestDTO()]));
      expect(createSpy).toHaveBeenCalledTimes(0);
      await controller.getGuests(3, new GuestFilter())
        .then(() => expect(createSpy).toHaveBeenCalledTimes(1));
    });
  });

  describe('updateGuest', () => {
    it('should call guestService.update', async () => {
      const createSpy = jest.spyOn(guestService, 'update').mockImplementation(async () => Promise.resolve());
      expect(createSpy).toHaveBeenCalledTimes(0);
      await controller.updateGuest(3, new GuestDTO(), 1)
        .then(() => expect(createSpy).toHaveBeenCalledTimes(1));
    });

    describe('deleteGuest', () => {
      it('should call guestService.delete', async () => {
        const deleteSpy = jest.spyOn(guestService, 'delete').mockImplementation(async () => Promise.resolve());
        expect(deleteSpy).toHaveBeenCalledTimes(0);
        await controller.deleteGuest(3, 1)
          .then(() => expect(deleteSpy).toHaveBeenCalledTimes(1));
      });
    });
  });
});
