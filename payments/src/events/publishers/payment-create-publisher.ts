import { PaymentCreatedEvent, Publisher, Subjects } from '@nicovuitickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
