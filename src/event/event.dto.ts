import { Length } from 'class-validator';

class EventDTO {
  id: number;

  @Length(3, 100)
  name: string;
}

export default EventDTO;
