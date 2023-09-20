import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/tickets';

it('should return a 404 if the ticket is not found', async () => {
  const response = await request(app).get('/api/tickets/dummyticketi').send().expect(404);
});

it('should return the ticket if the ticket is found', async () => {
  const title: string = 'test title';
  const price: number = 20;

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);

  const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`).send().expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
