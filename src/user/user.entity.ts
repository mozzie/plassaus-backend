import {
  Column, Entity, PrimaryColumn,
} from 'typeorm';
import UserDTO from './user.dto';

@Entity('user')
class User {
  @PrimaryColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 100 })
  password: string;

  setDTO(dto: UserDTO) : void {
    this.name = dto.name;
    this.email = dto.email;
    this.password = dto.password;
  }

  getDTO() : UserDTO {
    const dto : UserDTO = new UserDTO();
    dto.id = this.id;
    dto.name = this.name;
    dto.email = this.email;
    return dto;
  }

//  @BeforeInsert()
  // async hashPassword() {
  //   this.password = await bcrypt.hash(this.password, 10);
  // }
}

export default User;
