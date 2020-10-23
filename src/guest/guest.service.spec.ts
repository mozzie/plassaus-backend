import { Test } from '@nestjs/testing';
import { UpdateResult, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import GuestService from './guest.service';
import Guest from './guest.entity';
import GuestDTO from './guest.dto';
import GuestFilter from './guest.filter';
import QueryBuilderMock from '../../test/querybuilder.mock';

describe('GuestService', () => {
  let service: GuestService;
  let repository: Repository<Guest>;
  beforeEach(async () => {
    const modRef = await Test.createTestingModule({
      providers: [
        GuestService,
        {
          provide: getRepositoryToken(Guest),
          useClass: Repository,
        },
      ],
    }).compile();
    service = modRef.get(GuestService);
    repository = modRef.get<Repository<Guest>>(getRepositoryToken(Guest));
  });

  describe('create', () => {
    it('should call repository with correct event ID and name', async () => {
      const saveSpy = jest.spyOn(repository, 'save').mockImplementation(async () => Promise.resolve(new Guest()));
      const guest: GuestDTO = new GuestDTO();
      guest.name = 'guest name';

      await service.create(guest, 3).then(() => {
        expect(saveSpy).toHaveBeenCalledWith({ event: { id: 3 }, name: 'guest name' });
      });
    });
  });

  describe('createBatch', () => {
    it('should call repository with correct event IDs and names', async () => {
      const saveSpy = jest.spyOn(repository, 'save').mockImplementation(async () => Promise.resolve(new Guest()));
      const guest: GuestDTO = new GuestDTO();
      guest.name = 'guest name';
      const otherGuest: GuestDTO = new GuestDTO();
      otherGuest.name = 'another name';

      await service.createBatch([guest, otherGuest], 3).then(() => {
        expect(saveSpy).toHaveBeenCalledWith([
          { event: { id: 3 }, name: 'guest name' },
          { event: { id: 3 }, name: 'another name' },
        ]);
      });
    });
  });

  describe('findOne', () => {
    it('should call repository with correct guest and event ID', async () => {
      const findSpy = jest.spyOn(repository, 'findOneOrFail').mockImplementation(async () => Promise.resolve(new Guest()));

      await service.findOne(3, 4).then(() => {
        expect(findSpy).toHaveBeenCalledWith({ event: { id: 4 }, id: 3 });
      });
    });
  });

  describe('find', () => {
    it('should call repository with correct filter conditions and event ID', async () => {
      const mock = new QueryBuilderMock<Guest>();
      jest.spyOn(repository, 'createQueryBuilder').mockImplementation(() => mock);
      const filter: GuestFilter = new GuestFilter();
      filter.name = 'search';
      filter.page = 3;
      filter.pageSize = 20;
      filter.sortBy = 'name';
      filter.sortOrder = 'DESC';
      await service.find(filter, 4).then(() => {
        expect(mock.where).toHaveBeenCalledWith('guest.name like :name', { name: '%search%' });
        expect(mock.where).toHaveBeenCalledWith({ event: { id: 4 } });
        expect(mock.skip).toHaveBeenCalledWith(60);
        expect(mock.take).toHaveBeenCalledWith(20);
        expect(mock.orderBy).toHaveBeenCalledWith({ name: 'DESC' });
        expect(mock.getMany).toHaveBeenCalledTimes(1);
      });
    });

    it('should call repository without paging if pageSize is zero', async () => {
      const mock = new QueryBuilderMock<Guest>();
      jest.spyOn(repository, 'createQueryBuilder').mockImplementation(() => mock);
      const filter: GuestFilter = new GuestFilter();
      filter.name = 'search';
      filter.page = 3;
      filter.pageSize = 0;
      filter.sortBy = 'name';
      filter.sortOrder = 'DESC';
      await service.find(filter, 4).then(() => {
        expect(mock.skip).toHaveBeenCalledTimes(0);
        expect(mock.take).toHaveBeenCalledTimes(0);
      });
    });

    it('should not call repository with name filter if not given', async () => {
      const mockBuilder = new QueryBuilderMock<Guest>();
      jest.spyOn(repository, 'createQueryBuilder').mockImplementation(() => mockBuilder);
      const filter: GuestFilter = new GuestFilter();
      filter.page = 3;
      filter.pageSize = 20;
      filter.sortOrder = 'DESC';
      await service.find(filter, 4).then(() => {
        expect(mockBuilder.where.mock.calls).toEqual([[{ event: { id: 4 } }]]);
        expect(mockBuilder.getMany).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('update', () => {
    it('should call repository with correct guest  and event ID', async () => {
      jest.spyOn(repository, 'findOneOrFail').mockImplementation(async () => Promise.resolve(new Guest()));
      const updateSpy = jest.spyOn(repository, 'update').mockImplementation(async () => Promise.resolve(new UpdateResult()));
      const dto : GuestDTO = new GuestDTO();
      dto.name = 'new_name';
      dto.id = 2;
      await service.update(dto, 4).then(() => {
        expect(updateSpy).toHaveBeenCalledWith({ event: { id: 4 }, id: 2 }, dto);
      });
    });
    it('should not call repository if guest is not found', async () => {
      jest.spyOn(repository, 'findOneOrFail').mockImplementation(async () => Promise.reject(new EntityNotFoundError('guest', { id: 2 })));
      const updateSpy = jest.spyOn(repository, 'update').mockImplementation(async () => Promise.resolve(new UpdateResult()));
      const dto : GuestDTO = new GuestDTO();
      dto.name = 'new_name';
      dto.id = 2;
      await service.update(dto, 4).catch(() => {
        expect(updateSpy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('delete', () => {
    it('should call repository with correct guest ID', async () => {
      const guest = new Guest();
      guest.id = 2;
      jest.spyOn(repository, 'findOneOrFail').mockImplementation(async () => Promise.resolve(guest));
      const deleteSpy = jest.spyOn(repository, 'softDelete').mockImplementation(async () => Promise.resolve(new UpdateResult()));
      await service.delete(2, 4).then(() => {
        expect(deleteSpy).toHaveBeenCalledWith(2);
      });
    });

    it('should not call repository if guest is not found', async () => {
      jest.spyOn(repository, 'findOneOrFail').mockImplementation(async () => Promise.reject(new EntityNotFoundError('guest', { id: 2 })));
      const deleteSpy = jest.spyOn(repository, 'softDelete').mockImplementation(async () => Promise.resolve(new UpdateResult()));
      await service.delete(2, 4).catch(() => {
        expect(deleteSpy).toHaveBeenCalledTimes(0);
      });
    });
  });
});
