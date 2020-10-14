import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import AuthService from './auth.service';
import UserService from '../user/user.service';
import mockedJwtService from './jwtservice.mock';
import User from '../user/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService : JwtService;
  let userRepository : Repository<User>;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [

        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
      ],
    })
      .compile();
    userService = new UserService(userRepository);
    jwtService = await module.get(JwtService);
    service = new AuthService(userService, jwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should query DB for the user and return null if user is not found', () => {
      const user: User = undefined;
      const findSpy = jest.spyOn(userService, 'findByEmail').mockImplementation(async () => Promise.resolve(user));
      expect(findSpy).toHaveBeenCalledTimes(0);
      service.validateUser('email', 'password').then((data) => {
        expect(findSpy).toHaveBeenCalledTimes(1);
        expect(data).toBeNull();
      });
    });
    it('should query DB for the user and return null if password does not match', () => {
      const user: User = new User();
      user.email = 'email';
      user.password = 'wrong_password';
      const findSpy = jest.spyOn(userService, 'findByEmail').mockImplementation(async () => Promise.resolve(user));
      expect(findSpy).toHaveBeenCalledTimes(0);
      service.validateUser('email', 'password').then((data) => {
        expect(findSpy).toHaveBeenCalledTimes(1);
        expect(data).toBeNull();
      });
    });
    it('should query DB for the user and return user if user is found and password matches', () => {
      const user: User = new User();
      user.email = 'email';
      user.password = 'password';
      const findSpy = jest.spyOn(userService, 'findByEmail').mockImplementation(async () => Promise.resolve(user));
      expect(findSpy).toHaveBeenCalledTimes(0);
      service.validateUser('email', 'password').then((data) => {
        expect(findSpy).toHaveBeenCalledTimes(1);
        expect(data).toEqual(user.getDTO());
      });
    });
  });

  describe('getAccessToken', () => {
    it('should call jwtService.sign', () => {
      const accessToken : string = undefined;
      const signSpy = jest.spyOn(jwtService, 'sign').mockImplementation(() => accessToken);
      expect(signSpy).toHaveBeenCalledTimes(0);
      service.getAccessToken({ username: 'email', sub: 1 });
      expect(signSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('should call jwtService.sign and query DB', () => {
      const findSpy = jest.spyOn(userService, 'findByEmail').mockImplementation(async () => Promise.resolve(new User()));
      const signSpy = jest.spyOn(jwtService, 'sign').mockImplementation(() => null);
      expect(signSpy).toHaveBeenCalledTimes(0);
      expect(findSpy).toHaveBeenCalledTimes(0);
      service.login('email').then(() => {
        expect(signSpy).toHaveBeenCalledTimes(1);
        expect(findSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
