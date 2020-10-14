import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import UserService from './user.service';
import User from './user.entity';
import UserDTO from './user.dto';

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
    it('should return BadRequestException if passwords do not match', () => {
      const dto : UserDTO = new UserDTO();
      dto.password = 'password1';
      dto.password2 = 'password2';
      expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should return BadRequestException if email exists', () => {
      const dto : UserDTO = new UserDTO();
      dto.password = 'password1';
      dto.password2 = 'password1';
      dto.email = 'existing';
      jest.spyOn(service, 'findByEmail').mockImplementation(() => Promise.resolve(new User()));

      expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should save user to DB', () => {
      const dto : UserDTO = new UserDTO();
      dto.password = 'password1';
      dto.password2 = 'password1';
      dto.email = 'email@email.com';
      dto.name = 'user name';
      const user: User = undefined;
      jest.spyOn(service, 'findByEmail').mockImplementation(async () => Promise.resolve(user));
      const saveSpy = jest.spyOn(repository, 'save').mockImplementation(async () => Promise.resolve(new User()));
      expect(saveSpy).toHaveBeenCalledTimes(0);
      service.create(dto).then(() => {
        expect(saveSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
  describe('findByEmail', () => {
    it('should call repository with email parameter', () => {
      const saveSpy = jest.spyOn(repository, 'findOne').mockImplementation(async () => Promise.resolve(new User()));
      service.findByEmail('user@email.com').then(() => {
        expect(saveSpy).toHaveBeenCalledWith({ email: 'user@email.com' });
      });
    });
  });
});
