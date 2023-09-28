import { Publisher, Subjects, TicketCreatedEvent } from '@nicovuitickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
