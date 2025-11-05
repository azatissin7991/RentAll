import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import housingRoutes from './routes/housing.js';
import autoRoutes from './routes/auto.js';
import parcelsRoutes from './routes/parcels.js';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contact.js';
import connectDB from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Contact routes (public)
app.use('/api/contact', contactRoutes);

// Protected routes
app.use('/api/housing', housingRoutes);
app.use('/api/auto', autoRoutes);
app.use('/api/parcels', parcelsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

