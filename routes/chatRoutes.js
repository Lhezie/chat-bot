import express from 'express';
import axios from 'axios';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';

const router = express.Router();

const OPTIONS = `Welcome to QuickBite Bot!
Please select an option:
1 - Place an order
99 - Checkout order
98 - See order history
97 - See current order
0 - Cancel order`;

router.post('/', async (req, res) => {
  console.log(' Chat route hit');

  try {
    const { message, sessionId } = req.body;
    console.log(' Message:', message, '|  Session:', sessionId);

    const session = req.session;
    session.deviceId = sessionId;
    if (!session.currentOrder) session.currentOrder = [];
    const input = message.trim();
    console.log(' Cleaned input:', input);

    switch (input) {
      case '1': {
        console.log(' Fetching menu...');
        const menu = await MenuItem.find();
        console.log(' Menu items found:', menu.length);
        session.menu = menu;
        const menuList = menu.map((item, i) => `${i + 1} - ${item.name} - ₦${item.price}`).join('\n');
        return res.json({ reply: `Menu:\n${menuList}\nSelect item number to add.` });
      }

      case '99': {
        if (!session.currentOrder.length) {
          return res.json({ reply: 'No order to place.\nType 1 to start a new order.' });
        }

        const total = session.currentOrder.reduce((sum, item) => sum + item.price, 0);
        console.log(`💰 Total: ₦${total} | Items:`, session.currentOrder.length);

        const newOrder = await Order.create({
          sessionId: session.deviceId,
          items: session.currentOrder,
          total,
          paid: false,
          status: 'Pending'
        });

        session.currentOrder = [];

        // Payment setup
        console.log('🔗 Creating Paystack payment link...');
        const paystackResponse = await axios.post(
          'https://api.paystack.co/transaction/initialize',
          {
            email: `${session.deviceId}@guest.com`,
            amount: total * 100,
            metadata: { orderId: newOrder._id.toString() },
            callback_url: `${process.env.BASE_URL}/payment/callback`
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const paymentUrl = paystackResponse.data.data.authorization_url;
        return res.json({
          reply: ` Order placed!\nTotal: ₦${total}\n Click below to pay:\n${paymentUrl}`
        });
      }

      case '98': {
        console.log('📜 Fetching order history...');
        const orders = await Order.find({ sessionId: session.deviceId });
        const history = orders.map((o, i) => `${i + 1}. ₦${o.total} - ${o.status}`).join('\n');
        return res.json({ reply: `Order History:\n${history || 'No orders yet.'}` });
      }

      case '97': {
        if (!session.currentOrder.length) {
          return res.json({ reply: ' No current order.' });
        }
        const list = session.currentOrder.map((item, i) => `${i + 1}. ${item.name} - ₦${item.price}`).join('\n');
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
          return res.json({
            reply: `${menu[index].name} added to your order.\nType another number or 99 to checkout.`
          });
        }
        return res.json({ reply: OPTIONS });
      }
    }
  } catch (error) {
    console.error('Chat route error:', error);
    return res.status(500).send('Something went wrong in the chat route.');
  }
});

export default router;
