import express from 'express';
import axios from 'axios';
import Order from '../models/Order.js';

const router = express.Router();

// 1. Handle Paystack's redirect after payment (optional fallback)
router.get('/callback', async (req, res) => {
  const { reference } = req.query;

  try {
    // Verify payment from Paystack
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
        }
      }
    );

    const data = verifyRes.data.data;
    const metadata = data.metadata;
    const orderId = metadata?.orderId;

    if (data.status === 'success' && orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paid: true,
        status: 'Paid'
      });

      return res.send('Payment verified and order updated!');
    } else {
      return res.send('⚠️ Payment not successful.');
    }

  } catch (err) {
    console.error('Error verifying payment:', err.response?.data || err.message);
    return res.status(500).send('Error verifying payment');
  }
});

// ✅ 2. Handle webhook (preferred)
router.post(
  '/webhook',
  express.json({ type: 'application/json' }), // Ensure JSON body parsing
  async (req, res) => {
    const event = req.body;

    console.log('📡 Webhook received:', event.event);

    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const metadata = event.data.metadata;
      const orderId = metadata?.orderId;

      if (orderId) {
        try {
          await Order.findByIdAndUpdate(orderId, {
            paid: true,
            status: 'Paid'
          });

          console.log('Order updated successfully from webhook');
        } catch (err) {
          console.error('Failed to update order via webhook:', err.message);
        }
      }
    }

    // Respond with 200 to acknowledge receipt to Paystack
    res.sendStatus(200);
  }
);

export default router;
