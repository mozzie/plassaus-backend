import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import configService from '../config/config.service';
import JwtUser from './jwtuser.entity';
import JwtPayload from './jwtpayload.entity';

@Injectable()
class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getJwtSecret(),
    });
  }

  validate = async (payload: JwtPayload) : Promise<JwtUser> => Promise.resolve(
    {
      id: payload.sub,
      email: payload.username,
    },
  );
}

export default JwtStrategy;
