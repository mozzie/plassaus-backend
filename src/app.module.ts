import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import GuestModule from './guest/guest.module';
import UserModule from './user/user.module';
import EventModule from './event/event.module';
import AuthService from './auth/auth.service';
import AppController from './app.controller';
import UserService from './user/user.service';
import configService from './config/config.service';
import AppService from './app.service';
import User from './user/user.entity';
import JwtStrategy from './auth/jwt.strategy';
import LocalStrategy from './auth/local.strategy';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: configService.getJwtSecret(),
      signOptions: { expiresIn: '86400s' },
    }),
    EventModule,
    UserModule,
    GuestModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserService, AuthService, JwtStrategy, LocalStrategy],
})
class AppModule {}

export default AppModule;
