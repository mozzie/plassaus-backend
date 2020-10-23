import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import GuestDTO from './guest.dto';

class GuestListDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestDTO)
  guests: GuestDTO[];

  constructor(guests: GuestDTO[]) {
    this.guests = guests;
  }
}

export default GuestListDTO;
