// backend/src/index.ts
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import mangoRoutes from './routes/mango';
import orderRoutes from './routes/order';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB with dedicated database
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://Amitumikeyahay:Amb0KzBetxDVVYBT@cluster0.ebsbi.mongodb.net/bikikinionline_mango?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log('Connected to MongoDB: bikikinionline_mango'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/mangoes', mangoRoutes);
app.use('/api/orders', orderRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
