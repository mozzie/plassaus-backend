import {
  Injectable, CanActivate, ExecutionContext, UnauthorizedException,
} from '@nestjs/common';
import IncomingWithUser from './incomingwithuser.entity';
import EventService from '../event/event.service';

@Injectable()
class EventGuard implements CanActivate {
  constructor(private eventService: EventService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request : IncomingWithUser = context.switchToHttp().getRequest<IncomingWithUser>();
    const { user } = request;
    if (!user || !request.params.eventId) {
      throw new UnauthorizedException();
    }
    await this.eventService.findOne(request.params.eventId, user);
    return true;
  }
}
export default EventGuard;
