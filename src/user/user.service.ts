import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import UserDTO from './user.dto';

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
    user.setDTO(dto);
    await this.userRepository.save(user);
    return user.getDTO();
  }

  async findByEmail(email: string) : Promise<User> {
    return this.userRepository.findOne({ email });
  }
}

export default UserService;
