import mongoose from 'mongoose';

// An interface describing the properties required to create a new Payment (for Typescript)
interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

// An interface describing the properties that a Payment Document has
interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

// An interface describing the properties that a Payment Model has
interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}
const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };
