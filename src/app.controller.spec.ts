import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import AppController from './app.controller';
import UserService from './user/user.service';
import User from './user/user.entity';
import UserDTO from './user/user.dto';
import LoginDTO from './auth/login.dto';
import AuthService from './auth/auth.service';

describe('AppController', () => {
  let appController: AppController;
  let userService: UserService;
  let authService: AuthService;
  let jwtService : JwtService;
  let userRepository : Repository<User>;
  beforeEach(() => {
    userService = new UserService(userRepository);
    authService = new AuthService(userService, jwtService);
    appController = new AppController(userService, authService);
  });

  describe('register', () => {
    it('should call userService.create', () => {
      const createSpy = jest.spyOn(userService, 'create').mockImplementation(async (data) => Promise.resolve(data));
      expect(createSpy).toHaveBeenCalledTimes(0);
      appController.registerUser(new UserDTO())
        .then(() => expect(createSpy).toHaveBeenCalledTimes(1));
    });
  });

  describe('login', () => {
    it('should call findByEmail and getAccessToken', () => {
      const findSpy = jest.spyOn(userService, 'findByEmail').mockImplementation(async () => Promise.resolve(new User()));
      const accessTokenSpy = jest.spyOn(authService, 'getAccessToken').mockImplementation(() => 'access_token1');
      expect(findSpy).toHaveBeenCalledTimes(0);
      expect(accessTokenSpy).toHaveBeenCalledTimes(0);
      appController.login(new LoginDTO()).then(() => {
        expect(findSpy).toHaveBeenCalledTimes(1);
        expect(accessTokenSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('profile', () => {
    it('should call userService.findByEmail', () => {
      const findSpy = jest.spyOn(userService, 'findByEmail').mockImplementation(async () => Promise.resolve(new User()));
      expect(findSpy).toHaveBeenCalledTimes(0);
      appController.getProfile(new User()).then(() => expect(findSpy)
        .toHaveBeenCalledTimes(1));
    });
  });
});
