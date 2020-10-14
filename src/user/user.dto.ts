import { Length, IsEmail, IsNotEmpty } from 'class-validator';

class UserDTO {
  id: number;

  @Length(3, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  password2: string;
}

export default UserDTO;
