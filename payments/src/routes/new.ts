import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@nicovuitickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-create-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order');
    }

    // Create stripe charge
    const charge = await stripe.charges.create({
      currency: 'eur',
      amount: order.price * 100,
      source: token,
    });
    // save payment info in our database
    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });
    payment.save();

    // we do not await because we don't care if the event is published before returning our response.
    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };
