
import express from 'express';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();



router.post('/', async (req, res) => {
  try {
    const items = [
      { name: 'Jollof Rice', price: 1500 },
      { name: 'Chicken Burger', price: 2000 },
      { name: 'Pizza (Large)', price: 3500 },
      { name: 'Fried Rice with Chicken', price: 1800 },
      { name: 'Jollof Rice', price: 1500 },
    ];
    console.log('Seeding menu with items:', items);
    await MenuItem.insertMany(items);
    res.send('Menu seeded successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error seeding menu');
  }
});

export default router;
