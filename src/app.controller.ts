import {
  Controller, Get, Post, Body, UseGuards,
} from '@nestjs/common';
import UserService from './user/user.service';
import UserDTO from './user/user.dto';
import LoginDTO from './auth/login.dto';
import AuthService from './auth/auth.service';
import LocalAuthGuard from './auth/local-auth.guard';
import JwtAuthGuard from './auth/jwt-auth.guard';
import AuthUser from './auth/authuser.decorator';
import JwtUser from './auth/jwtuser.entity';

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

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@AuthUser() jwtUser : JwtUser) : Promise<UserDTO> {
    const user = await this.userService.findByEmail(jwtUser.email);
    return user.getDTO();
  }
}

export default AppController;
