import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/tickets';
import { natsWrapper } from '../../nats-wrapper';

it('should have a route handler listening to /api/tickets for post request', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('should return a status different than 401 if the user is signed in', async () => {
  const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({});

  expect(response.status).not.toEqual(401);
});

it('should return an error if an invalid title is provided', async () => {
  await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: '', price: 10 }).expect(400);

  await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ price: 10 }).expect(400);
});

it('should return an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'test title', price: -10 })
    .expect(400);

  await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'test title' }).expect(400);
});

it('should create a ticket if valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title: string = 'test title';
  const price: number = 20;
  // Add in a check to make sure the ticket was save in DB
  await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title, price }).expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(title);
  expect(tickets[0].price).toEqual(price);
});

it('should publish an event', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title: string = 'test title';
  const price: number = 20;
  // Add in a check to make sure the ticket was save in DB
  await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title, price }).expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
