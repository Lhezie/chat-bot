import express from 'express';
import cors from 'cors';
import session from 'express-session';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import chatRoutes from './routes/chatRoutes.js';
import paystackRoutes from './routes/paystackRoutes.js'
import seedMenu from './seed/seedMenu.js';

dotenv.config();

const app = express();
console.log(' Server is starting...');

app.use((req, res, next) => {
    console.log(' Incoming:', req.method, req.path);
    next();
  });
  
  const PORT = process.env.PORT || 6000;
  if (isNaN(PORT)) {
    throw new Error(` Invalid PORT value in .env: ${PORT}`);
  }
  

app.use(cors());
app.use(express.json()); 
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
});

app.use('/', chatRoutes);
app.use('/payment', paystackRoutes);
app.use('/seedmenu', seedMenu);


app.get('/', (req, res) => {
  res.send('Restaurant ChatBot API is running');
});

app.post('/test', (req, res) => {
    console.log(' Test route hit!');
    res.send('Test successful!');
  });
  
app.use((req, res) => {
    res.status(404).send(` Route not found: ${req.method} ${req.path}`);
  });
  

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
