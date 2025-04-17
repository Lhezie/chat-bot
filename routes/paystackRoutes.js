// routes/paystack.js
import express from 'express';
import axios from 'axios';
import Order from '../models/Order.js';

const router = express.Router();

router.get('/payment', async (req, res) => {
  const { reference } = req.query;

  try {
    const verifyRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
      }
    });

    const metadata = verifyRes.data.data.metadata;
    const orderId = metadata.orderId;

    if (verifyRes.data.data.status === 'success') {
      await Order.findByIdAndUpdate(orderId, { paid: true, status: 'Paid' });
      return res.send('Payment successful! You may return to chat.');
    } else {
      return res.send('Payment failed or incomplete.');
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error verifying payment');
  }
});

export default router;
