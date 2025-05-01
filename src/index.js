import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import mangoRoutes from './routes/mango.js';
import orderRoutes from './routes/order.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://Amitumikeyahay:Amb0KzBetxDVVYBT@cluster0.ebsbi.mongodb.net/bikikinionline_mango?retryWrites=true&w=majority&appName=Cluster0", {
      dbName: "bikikinionline_mango",
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
      auth: {
        username: 'Amitumikeyahay',
        password: 'Amb0KzBetxDVVYBT'
      }
    });
    console.log('Connected to MongoDB: bikikinionline_mango');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
connectDB();

// Routes
app.use('/api/mangoes', mangoRoutes);
app.use('/api/orders', orderRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
