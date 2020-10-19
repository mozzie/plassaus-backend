import {
  Column, Entity, OneToMany, PrimaryColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import UserDTO from './user.dto';
import Event from '../event/event.entity';

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

  @OneToMany(() => Event, (event) => event.owner)
  events: Event[];

  async setDTO(dto: UserDTO) : Promise<void> {
    this.name = dto.name;
    this.email = dto.email;
    this.password = await bcrypt.hash(dto.password, 10);
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
