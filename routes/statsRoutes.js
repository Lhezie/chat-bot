// routes/statsRoutes.js
import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

router.get('/most-ordered', async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $unwind: '$items' },
      { $group: {
        _id: '$items.name',
        count: { $sum: 1 },
      }},
      { $sort: { count: -1 } },
    ]);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
