import { useEffect, useState } from "react";
import useRequest from "../../hooks/use-request";
import Router from "next/router";
import StripeCheckout from "react-stripe-checkout";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: { orderId: order.id },
    onSuccess: (payment) => {
      return Router.push("/orders");
    },
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft(); // call without waiting first
    const timerId = setInterval(findTimeLeft, 1000); // setup an interval to run the function every seconds

    return () => {
      // stop the interval if we leave the page
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order expired</div>;
  }
  return (
    <div>
      <h1>Purchasing {order.ticket.title}</h1>
      <p>Time left to pay: {timeLeft} seconds</p>
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51OAYNIIdUHQ0gAWiV9EGyhRNpyypRk9lG6hv2AHSFdDcg5hs4UcNzIF9Ai9LaIeKmW4b8ZD3FgM9rVcwstvTnkfV00WGgTwlOB"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
