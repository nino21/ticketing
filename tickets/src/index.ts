import { DatabaseConnectionError } from '@nicovuitickets/common';
import { randomBytes } from 'crypto';
import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY environment variable is not defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not defined');
  }

  try {
    await natsWrapper.connect('ticketing', randomBytes(4).toString('hex'), 'http://nats-svc:4222');
    // we put it here in a central location (index.ts) because process.exit(); is not nice is hidden somewhere in a common library
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDb');
  } catch (err) {
    console.error(err);
    throw new DatabaseConnectionError();
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

start();
