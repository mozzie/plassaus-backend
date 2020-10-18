import {
  Controller, Post, Body, UseGuards,
} from '@nestjs/common';
import UserService from './user/user.service';
import UserDTO from './user/user.dto';
import LoginDTO from './auth/login.dto';
import AuthService from './auth/auth.service';
import LocalAuthGuard from './auth/local-auth.guard';

@Controller('/')
class AppController {
  constructor(private readonly userService: UserService,
    private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() dto : UserDTO): Promise<UserDTO> {
    return this.userService.create(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() login : LoginDTO) : Promise<{[key: string] : string}> {
    return this.authService.login(login.username);
  }
}

export default AppController;
