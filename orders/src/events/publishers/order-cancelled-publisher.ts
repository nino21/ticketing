import { OrderCancelledEvent, Publisher, Subjects } from '@nicovuitickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
