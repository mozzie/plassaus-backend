import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import User from './user.entity';
import UserDTO from './user.dto';
import JwtUser from '../auth/jwtuser.entity';

@Injectable()
class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: UserDTO) : Promise<UserDTO> {
    if (dto.password !== dto.password2) {
      throw new BadRequestException('Passwords did not match');
    }

    const existingUser : User = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    const user: User = new User();
    await user.setDTO(dto);

    await this.userRepository.save(user);
    return user.getDTO();
  }

  async findByEmail(email: string) : Promise<User> {
    return this.userRepository.findOne({ email });
  }

  async update(dto: UserDTO, jwtUser: JwtUser) : Promise<void> {
    const newDTO : UserDTO = new UserDTO();
    newDTO.id = jwtUser.id;
    if (dto.name) {
      newDTO.name = dto.name;
    }
    if (dto.password) {
      newDTO.password = await bcrypt.hash(dto.password, 10);
    }
    await this.userRepository.update({ id: jwtUser.id }, newDTO);
  }
}

export default UserService;
