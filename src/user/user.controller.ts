import {
  Body, Controller, Get, Put, UseGuards, BadRequestException,
} from '@nestjs/common';
import JwtAuthGuard from '../auth/jwt-auth.guard';
import AuthUser from '../auth/authuser.decorator';
import JwtUser from '../auth/jwtuser.entity';
import UserDTO from './user.dto';
import UserService from './user.service';

@Controller('users')
class UserController {
  constructor(
    private userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Put('')
  async updateUser(@AuthUser() jwtUser: JwtUser, @Body() dto: UserDTO) : Promise<void> {
    const sanitizedDTO : UserDTO = new UserDTO();
    if (dto.name) {
      sanitizedDTO.name = dto.name;
    }
    if (dto.password && dto.password !== dto.password2) {
      throw new BadRequestException('Passwords did not match');
    }
    if (dto.password && dto.password === dto.password2) {
      sanitizedDTO.password = dto.password;
    }
    await this.userService.update(sanitizedDTO, jwtUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@AuthUser() jwtUser : JwtUser) : Promise<UserDTO> {
    const user = await this.userService.findByEmail(jwtUser.email);
    return user.getDTO();
  }
}

export default UserController;
