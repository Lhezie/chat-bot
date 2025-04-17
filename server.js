import express from 'express';
import cors from 'cors';
import session from 'express-session';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import chatRoutes from './routes/chatRoutes.js';
import paystackRoutes from './routes/paystack.js';
import seedMenu from './seed/seedMenu.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // ✅ This is all you need
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/chat', chatRoutes);
app.use('/paystack', paystackRoutes);
app.use('/seed-menu', seedMenu);

app.get('/', (req, res) => {
  res.send('Restaurant ChatBot API is running');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
