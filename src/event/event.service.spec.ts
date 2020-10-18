import { Test } from '@nestjs/testing';
import { UpdateResult, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import EventService from './event.service';
import Event from './event.entity';
import EventDTO from './event.dto';
import JwtUser from '../auth/jwtuser.entity';
import EventFilter from './event.filter';
import QueryBuilderMock from '../../test/querybuilder.mock';

describe('EventService', () => {
  let service: EventService;
  let repository: Repository<Event>;
  beforeEach(async () => {
    const modRef = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getRepositoryToken(Event),
          useClass: Repository,
        },
      ],
    }).compile();
    service = modRef.get(EventService);
    repository = modRef.get<Repository<Event>>(getRepositoryToken(Event));
  });

  describe('create', () => {
    it('should call repository with correct owner ID and name', async () => {
      const saveSpy = jest.spyOn(repository, 'save').mockImplementation(async () => Promise.resolve(new Event()));
      const event: EventDTO = new EventDTO();
      event.name = 'event_name';
      const jwtUser : JwtUser = new JwtUser();
      jwtUser.id = 4;
      await service.create(event, jwtUser).then(() => {
        expect(saveSpy).toHaveBeenCalledWith({ owner: { id: 4 }, name: 'event_name' });
      });
    });
  });

  describe('findOne', () => {
    it('should call repository with correct event ID and owner ID', async () => {
      const findSpy = jest.spyOn(repository, 'findOneOrFail').mockImplementation(async () => Promise.resolve(new Event()));
      const jwtUser : JwtUser = new JwtUser();
      jwtUser.id = 4;
      await service.findOne(3, jwtUser).then(() => {
        expect(findSpy).toHaveBeenCalledWith({ owner: { id: 4 }, id: 3 });
      });
    });
  });

  describe('find', () => {
    it('should call repository with correct filter conditions and owner ID', async () => {
      const mock = new QueryBuilderMock<Event>();
      jest.spyOn(repository, 'createQueryBuilder').mockImplementation(() => mock);
      const filter: EventFilter = new EventFilter();
      filter.name = 'search';
      filter.page = 3;
      filter.pageSize = 20;
      filter.sortBy = 'name';
      filter.sortOrder = 'DESC';
      const jwtUser : JwtUser = new JwtUser();
      jwtUser.id = 4;
      await service.find(filter, jwtUser).then(() => {
        expect(mock.where).toHaveBeenCalledWith('event.name like :name', { name: '%search%' });
        expect(mock.where).toHaveBeenCalledWith({ owner: { id: 4 } });
        expect(mock.skip).toHaveBeenCalledWith(60);
        expect(mock.take).toHaveBeenCalledWith(20);
        expect(mock.orderBy).toHaveBeenCalledWith({ name: 'DESC' });
        expect(mock.getMany).toHaveBeenCalledTimes(1);
      });
    });

    it('should not call repository with name filter if not given', async () => {
      const mockBuilder = new QueryBuilderMock<Event>();
      jest.spyOn(repository, 'createQueryBuilder').mockImplementation(() => mockBuilder);
      const filter: EventFilter = new EventFilter();
      filter.page = 3;
      filter.pageSize = 20;
      filter.sortOrder = 'DESC';
      const jwtUser : JwtUser = new JwtUser();
      jwtUser.id = 4;
      await service.find(filter, jwtUser).then(() => {
        expect(mockBuilder.where.mock.calls).toEqual([[{ owner: { id: 4 } }]]);
        expect(mockBuilder.getMany).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('update', () => {
    it('should call repository with correct event ID and owner ID', async () => {
      jest.spyOn(repository, 'findOneOrFail').mockImplementation(async () => Promise.resolve(new Event()));
      const updateSpy = jest.spyOn(repository, 'update').mockImplementation(async () => Promise.resolve(new UpdateResult()));
      const jwtUser : JwtUser = new JwtUser();
      jwtUser.id = 4;
      const dto : EventDTO = new EventDTO();
      dto.name = 'new_name';
      dto.id = 2;
      await service.update(dto, jwtUser).then(() => {
        expect(updateSpy).toHaveBeenCalledWith({ owner: { id: 4 }, id: 2 }, dto);
      });
    });
  });
});
