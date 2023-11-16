import { ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from '@nicovuitickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;
  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message): Promise<void> {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }
    if (order.status === OrderStatus.Complete) {
      // we don't want to cancel a completed order
      // we ack the expiration message to mark it as treated
      msg.ack();
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    const event = {
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    };
    await new OrderCancelledPublisher(natsWrapper.client).publish(event);

    msg.ack();
  }
}
