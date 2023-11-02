import { ExpirationCompleteEvent, Publisher, Subjects } from '@nicovuitickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
