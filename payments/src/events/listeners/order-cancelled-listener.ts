import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from '@nicovuitickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCancelledEvent['data'], msg: Message): Promise<void> {
    // Find the order
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    // If no order, throw error
    if (!order) {
      throw new Error('Order not found');
    }

    // Mark the order as cancelled
    order.set({ status: OrderStatus.Cancelled });

    // Save the order
    await order.save();

    // Acknowledge the message
    msg.ack();
  }
}
