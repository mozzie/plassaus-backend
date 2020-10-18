import { Test } from '@nestjs/testing';
import { UpdateResult, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import UserService from './user.service';
import User from './user.entity';
import UserDTO from './user.dto';
import JwtUser from '../auth/jwtuser.entity';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  beforeEach(async () => {
    const modRef = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();
    service = modRef.get(UserService);
    repository = modRef.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should return BadRequestException if passwords do not match', async () => {
      const dto : UserDTO = new UserDTO();
      dto.password = 'password1';
      dto.password2 = 'password2';
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should return BadRequestException if email exists', async () => {
      const dto : UserDTO = new UserDTO();
      dto.password = 'password1';
      dto.password2 = 'password1';
      dto.email = 'existing';
      jest.spyOn(service, 'findByEmail').mockImplementation(() => Promise.resolve(new User()));

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should save user to DB', async () => {
      const dto : UserDTO = new UserDTO();
      dto.password = 'password1';
      dto.password2 = 'password1';
      dto.email = 'email@email.com';
      dto.name = 'user name';
      const user: User = undefined;
      jest.spyOn(service, 'findByEmail').mockImplementation(async () => Promise.resolve(user));
      const saveSpy = jest.spyOn(repository, 'save').mockImplementation(async () => Promise.resolve(new User()));
      expect(saveSpy).toHaveBeenCalledTimes(0);
      await service.create(dto).then(() => {
        expect(saveSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('findByEmail', () => {
    it('should call repository with email parameter', async () => {
      const saveSpy = jest.spyOn(repository, 'findOne').mockImplementation(async () => Promise.resolve(new User()));
      await service.findByEmail('user@email.com').then(() => {
        expect(saveSpy).toHaveBeenCalledWith({ email: 'user@email.com' });
      });
    });
  });

  describe('update', () => {
    it('should call repository update', async () => {
      const saveSpy = jest.spyOn(repository, 'update').mockImplementation(async () => Promise.resolve(new UpdateResult()));
      const jwtUser : JwtUser = new JwtUser();
      jwtUser.id = 3;
      const dto : UserDTO = new UserDTO();
      dto.id = 3;
      dto.name = 'updated';
      await service.update(dto, jwtUser).then(() => {
        expect(saveSpy).toHaveBeenCalledWith({ id: 3 }, dto);
      });
    });
  });
});
