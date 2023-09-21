import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/tickets';
import mongoose from 'mongoose';

const createTicket = (title: string, price: number, cookie?: string[]) => {
  if (!cookie) {
    cookie = global.signin();
  }
  return request(app).post('/api/tickets').set('Cookie', cookie).send({ title, price });
};

it('should return a 404 if the provider id does not exists', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const title: string = 'test title';
  const price: number = 20;
  await request(app).put(`/api/tickets/${id}`).set('Cookie', global.signin()).send({ title, price }).expect(404);
});

it('should return a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const title: string = 'test title';
  const price: number = 20;
  await request(app).put(`/api/tickets/${id}`).send({ title, price }).expect(401);
});

it('should return a 401 if the user does not own the ticket', async () => {
  const title: string = 'new title';
  const price: number = 99;
  const response = await createTicket('test title 1', 20);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(401);
});

it('should return a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signin();
  const response = await createTicket('test title 1', 20, cookie);

  const invalidTitle: string = '';
  const validPrice: number = 99;
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: invalidTitle, price: validPrice })
    .expect(400);

  const validTitle: string = 'valid title';
  const invalidPrice: number = -10;
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: validTitle, price: invalidPrice })
    .expect(400);
});

it('should update the ticket if the user provides a valid title or price', async () => {
  const cookie = global.signin();
  const response = await createTicket('test title 1', 20, cookie);

  const title: string = 'updated title';
  const price: number = 99;
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: title, price: price })
    .expect(200);

  const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`).send().expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
