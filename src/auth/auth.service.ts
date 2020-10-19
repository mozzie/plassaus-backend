import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import UserService from '../user/user.service';
import User from '../user/user.entity';
import UserDTO from '../user/user.dto';
import JwtPayload from './jwtpayload.entity';

@Injectable()
class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDTO> {
    const user : User = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user.getDTO();
    }
    return null;
  }

  getAccessToken(payload : JwtPayload) : string {
    return this.jwtService.sign(payload);
  }

  async login(email: string) : Promise<{[key: string] : string}> {
    const user : User = await this.userService.findByEmail(email);
    const payload : JwtPayload = { username: user.email, sub: user.id };
    return {
      access_token: this.getAccessToken(payload),
    };
  }
}

export default AuthService;
