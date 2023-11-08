import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

declare global {
  var signin: () => string[];
}

jest.mock('../nats-wrapper');

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'wxcc';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  await Promise.all(
    collections.map(async (collection) => {
      await collection.deleteMany({});
    })
  );
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

// global just to save the hassle of importing the helper in every relevant test files
global.signin = () => {
  // Build a JWT payload {id, email}
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Create the session object {jwt: <MY_JWT>}
  const session = { jwt: token };

  // take JSON and encode it as base64
  const sessionJSON = JSON.stringify(session);

  // return a string that's the cookie with the encoded data
  const base64 = Buffer.from(sessionJSON).toString('base64');

  return [`session=${base64}`];
};
