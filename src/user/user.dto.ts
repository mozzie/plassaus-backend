import {
  Length, IsEmail, IsNotEmpty, IsOptional,
} from 'class-validator';

class UserDTO {
  id: number;

  @IsOptional()
  @Length(3, 100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNotEmpty()
  password?: string;

  @IsOptional()
  @IsNotEmpty()
  password2?: string;
}

export default UserDTO;
