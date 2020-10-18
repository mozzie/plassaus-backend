import { Repository } from 'typeorm';
import UserController from './user.controller';
import UserService from './user.service';
import User from './user.entity';
import UserDTO from './user.dto';
import JwtUser from '../auth/jwtuser.entity';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let userRepository: Repository<User>;
  beforeEach(() => {
    userService = new UserService(userRepository);
    controller = new UserController(userService);
  });

  describe('updateUser', () => {
    it('should call userService.update with new name if it was in payload', async () => {
      const updateSpy = jest.spyOn(userService, 'update').mockImplementation(async () => Promise.resolve());
      expect(updateSpy).toHaveBeenCalledTimes(0);
      const dto : UserDTO = new UserDTO();
      dto.name = 'new_name';
      const jwtUser : JwtUser = new JwtUser();
      jwtUser.id = 4;

      await controller.updateUser(jwtUser, dto)
        .then(() => {
          expect(updateSpy).toHaveBeenCalledTimes(1);
          expect(updateSpy).toHaveBeenCalledWith({ name: 'new_name' } as UserDTO, jwtUser);
        });
    });

    it('should call userService.update with new password if it was in payload and matches password2', async () => {
      const updateSpy = jest.spyOn(userService, 'update').mockImplementation(async () => Promise.resolve());
      expect(updateSpy).toHaveBeenCalledTimes(0);
      const dto : UserDTO = new UserDTO();
      dto.password = 'newpass1';
      dto.password2 = 'newpass1';

      const jwtUser : JwtUser = new JwtUser();
      jwtUser.id = 4;

      await controller.updateUser(jwtUser, dto)
        .then(() => {
          expect(updateSpy).toHaveBeenCalledTimes(1);
          expect(updateSpy).toHaveBeenCalledWith({ password: 'newpass1' } as UserDTO, jwtUser);
        });
    });

    it('should call userService.update without new password if it was in payload and does not match password2', async () => {
      const updateSpy = jest.spyOn(userService, 'update').mockImplementation(async () => Promise.resolve());
      expect(updateSpy).toHaveBeenCalledTimes(0);
      const dto : UserDTO = new UserDTO();
      dto.password = 'newpass1';
      dto.password2 = 'newpass2';

      const jwtUser : JwtUser = new JwtUser();
      jwtUser.id = 4;

      await expect(controller.updateUser(jwtUser, dto))
        .rejects.toThrow('Passwords did not match');
      expect(updateSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('profile', () => {
    it('should call userService.findByEmail', async () => {
      const findSpy = jest.spyOn(userService, 'findByEmail').mockImplementation(async () => Promise.resolve(new User()));
      expect(findSpy).toHaveBeenCalledTimes(0);
      await controller.getProfile(new User()).then(() => expect(findSpy)
        .toHaveBeenCalledTimes(1));
    });
  });
});
