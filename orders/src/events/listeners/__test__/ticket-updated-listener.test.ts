import { TicketUpdatedEvent } from '@nicovuitickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  // Create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'movie',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, ticket, msg };
};

it('should find, update and save a ticket', async () => {
  const { listener, data, ticket, msg } = await setup();
  // Call the onMessage function
  await listener.onMessage(data, msg);

  // Write assertion to make sure the ticket was created and updated
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);

  expect(updatedTicket!.title).not.toEqual(ticket.title);
  expect(updatedTicket!.price).not.toEqual(ticket.price);
  expect(updatedTicket!.version).toEqual(ticket.version + 1);
});

it('should acknowledge the message', async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function
  await listener.onMessage(data, msg);

  // Write assertion to make sure the message is aknowledged
  expect(msg.ack).toHaveBeenCalled();
});

it('should not call the ack if the event has a skipped version number', async () => {
  const { listener, data, ticket, msg } = await setup();

  // Update the event data
  data.version = data.version + 5;

  // Call the onMessage function
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  // Write assertion to make sure the message is aknowledged
  expect(msg.ack).not.toHaveBeenCalled();
});
