import { Length } from 'class-validator';

class GuestDTO {
  id: number;

  @Length(3, 100)
  name: string;
}

export default GuestDTO;
