import express from 'express';
import cors from 'cors';
import session from 'express-session';
import mongoose from 'mongoose';
import statsRoutes from './routes/statsRoutes.js';


import dotenv from 'dotenv';

import chatRoutes from './routes/chatRoutes.js';
import paystackRoutes from './routes/paystackRoutes.js';
import seedMenu from './seed/seedMenu.js';

dotenv.config();

const app = express();
console.log(' Server is starting...');

app.use((req, res, next) => {
  console.log(' Incoming:', req.method, req.path);
  next();
});

const PORT = process.env.PORT || 3020;
if (isNaN(PORT)) {
  throw new Error(` Invalid PORT value in .env: ${PORT}`);
}

// ✅ UPDATED: CORS middleware with credentials
app.use(cors({ origin: true, credentials: true }));


app.use(express.json());

// ✅ UPDATED: Session middleware with cookies
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
    }
  }));
  

mongoose.connect(process.env.MONGO_URI);

app.use((req, res, next) => {
    console.log('🪵 Middleware HIT:', req.method, req.path);
    next();
  });
  
  app.post('/test-debug', (req, res) => {
    console.log('✅ /test-debug HIT');
    res.send('test-debug worked');
  });
  

app.use('/', chatRoutes);

app.use((req, res, next) => {
    console.log('⚡ Middleware check - Headers:', req.headers);
    console.log('⚡ Session object:', req.session);
    next();
});
  
app.use('/payment', paystackRoutes);
app.use('/seedmenu', seedMenu);
app.use('/stats', statsRoutes);

app.get('/', (req, res) => {
  res.send('Restaurant ChatBot API is running');
});

app.post('/test-simple', (req, res) => {
    res.json({ message: 'Route works!' });
  });
  

app.post('/test', (req, res) => {
  console.log(' Test route hit!');
  res.send('Test successful!');
});

app.use((req, res) => {
  res.status(404).send(` Route not found: ${req.method} ${req.path}`);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
