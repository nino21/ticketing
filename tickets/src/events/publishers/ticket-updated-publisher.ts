import { Publisher, Subjects, TicketUpdatedEvent } from '@nicovuitickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
