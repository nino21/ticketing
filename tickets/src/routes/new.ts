import { requireAuth, validateRequest } from '@nicovuitickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/tickets';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than zero'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    const savedTicket = await ticket.save();
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: savedTicket.id,
      title: savedTicket.title,
      price: savedTicket.price,
      userId: savedTicket.userId,
    });

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
