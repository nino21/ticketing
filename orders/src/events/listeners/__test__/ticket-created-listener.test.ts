import { TicketCreatedEvent } from '@nicovuitickets/common';
import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // Create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('should create and save a ticket', async () => {
  const { listener, data, msg } = await setup();
  // Call the onMessage function
  await listener.onMessage(data, msg);

  // Write assertion to make sure the ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('should acknowledge the message', async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function
  await listener.onMessage(data, msg);

  // Write assertion to make sure the message is aknowledged
  expect(msg.ack).toHaveBeenCalled();
});
