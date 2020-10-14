import { IncomingMessage } from 'http';
import JwtUser from './jwtuser.entity';

class IncomingWithUser extends IncomingMessage {
  user: JwtUser;
}

export default IncomingWithUser;
