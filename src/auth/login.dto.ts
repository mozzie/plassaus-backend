import { IsEmail, IsNotEmpty } from 'class-validator';
import User from '../user/user.entity';

class LoginDTO {
  @IsEmail()
  username: string;

  @IsNotEmpty()
  password: string;

  user: User;
}

export default LoginDTO;
