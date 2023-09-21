import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: string, price: number) => {
  return request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title, price });
};

it('can fetch the list of all tickets', async () => {
  await createTicket('test title 1', 20);
  await createTicket('test title 2', 15);
  await createTicket('test title 3', 10);

  const response = await request(app).get(`/api/tickets`).send().expect(200);

  expect(response.body.length).toEqual(3);
});
