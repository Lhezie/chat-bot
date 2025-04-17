// routes/chat.js
import express from 'express';
import axios from 'axios';
import MenuItem from '../models/MenuItem.js'
import Order from '../models/Order.js';

const router = express.Router();

const OPTIONS = `Welcome to QuickBite Bot!\nPlease select an option:\n1 - Place an order\n99 - Checkout order\n98 - See order history\n97 - See current order\n0 - Cancel order`;

router.post('/', async (req, res) => {
  const { message, sessionId } = req.body;
  const session = req.session;
  session.deviceId = sessionId;

  if (!session.currentOrder) session.currentOrder = [];
  const input = message.trim();

  switch (input) {
    case '1': {
      const menu = await MenuItem.find();
      session.menu = menu;
      const menuList = menu.map((item, i) => `${i + 1} - ${item.name} - ₦${item.price}`).join('\n');
      return res.json({ reply: `Menu:\n${menuList}\nSelect item number to add.` });
    }
    case '99': {
      if (session.currentOrder.length === 0) {
        return res.json({ reply: 'No order to place.\nType 1 to start a new order.' });
      }
      const total = session.currentOrder.reduce((sum, item) => sum + item.price, 0);
      const newOrder = await Order.create({
        sessionId: session.deviceId,
        items: session.currentOrder,
        total,
        paid: false,
        status: 'Pending'
      });
      session.currentOrder = [];

      const paystackResponse = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: `${session.deviceId}@guest.com`,
          amount: total * 100,
          metadata: { orderId: newOrder._id.toString() },
          callback_url: `${process.env.BASE_URL}/paystack/callback`
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const paymentUrl = paystackResponse.data.data.authorization_url;
      return res.json({ reply: `Order placed! Total: ₦${total}\nClick below to pay:\n${paymentUrl}` });
    }
    case '98': {
      const orders = await Order.find({ sessionId: session.deviceId });
      const history = orders.map((o, i) => `${i + 1}. ₦${o.total} - ${o.status}`).join('\n');
      return res.json({ reply: `Order History:\n${history}` });
    }
    case '97': {
      if (!session.currentOrder.length) return res.json({ reply: 'No current order.' });
      const list = session.currentOrder.map((i, index) => `${index + 1}. ${i.name} - ₦${i.price}`).join('\n');
      return res.json({ reply: `Current Order:\n${list}` });
    }
    case '0': {
      session.currentOrder = [];
      return res.json({ reply: 'Your order has been cancelled.' });
    }
    default: {
      const menu = session.menu || [];
      const index = parseInt(input) - 1;
      if (menu[index]) {
        session.currentOrder.push(menu[index]);
        return res.json({ reply: `${menu[index].name} added to order.\nType another number or 99 to checkout.` });
      }
      return res.json({ reply: OPTIONS });
    }
  }
});

export default router;
