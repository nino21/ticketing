import { OrderCreatedEvent, Publisher, Subjects } from '@nicovuitickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
